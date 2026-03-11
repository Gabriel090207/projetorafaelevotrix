from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from datetime import datetime
from app.core.firebase import db
from app.core.firebase_auth import verify_firebase_token
import uuid

router = APIRouter(prefix="/auth", tags=["Auth"])

security = HTTPBearer()


# =========================
# VALIDAR TOKEN FIREBASE
# =========================
def get_current_user(credentials=Depends(security)):
    try:
        decoded = verify_firebase_token(credentials.credentials)
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")


# =========================
# SINCRONIZAR USUÁRIO ADMIN
# =========================
@router.post("/sync-user")
def sync_user(user=Depends(get_current_user)):

    uid = user["uid"]
    email = user.get("email")
    nome = user.get("name", email.split("@")[0])

    empresas_ref = db.collection("empresas")

    for empresa in empresas_ref.stream():

        usuarios_ref = (
            empresa.reference
            .collection("usuarios")
            .where("email", "==", email)
            .stream()
        )

        for usuario in usuarios_ref:

            data = usuario.to_dict()

            return {
                "message": "Usuário já existente",
                "empresa_id": empresa.id,
                "perfil": data.get("perfil", "usuario")
            }

    # se não encontrar cria empresa
    empresa_id = str(uuid.uuid4())

    db.collection("empresas").document(empresa_id).set({
        "nome": f"{nome} Telecom",
        "plano": "trial",
        "status": "ativa",
        "email": email,
        "criado_em": datetime.utcnow().isoformat()
    })

    db.collection("empresas") \
      .document(empresa_id) \
      .collection("usuarios") \
      .document(uid) \
      .set({
          "nome": nome,
          "email": email,
          "perfil": "admin",
          "ativo": True,
          "criado_em": datetime.utcnow().isoformat()
      })

    return {
        "message": "Usuário criado",
        "empresa_id": empresa_id,
        "perfil": "admin"
    }


# =========================
# PEGAR DADOS DO USUÁRIO LOGADO
# =========================
@router.get("/me")
def get_me(user=Depends(get_current_user)):

    uid = user["uid"]
    email = user.get("email")

    empresas_ref = db.collection("empresas")

    for empresa in empresas_ref.stream():

        empresa_data = empresa.to_dict()

        # =========================
        # VERIFICAR USUARIOS (ADMIN / TECNICO)
        # =========================
        usuarios_ref = (
            empresa.reference
            .collection("usuarios")
            .where("email", "==", email)
            .stream()
        )

        for usuario in usuarios_ref:

            data = usuario.to_dict()

            return {
                "uid": uid,
                "email": email,
                "nome": data.get("nome"),
                "empresa_id": empresa.id,
                "empresa_nome": empresa_data.get("nome"),
                "perfil": data.get("perfil", "usuario")
            }

        # =========================
        # VERIFICAR CLIENTES
        # =========================
        clientes_ref = (
            empresa.reference
            .collection("clientes")
            .where("email", "==", email)
            .stream()
        )

        for cliente in clientes_ref:

            data = cliente.to_dict()

            return {
                "uid": uid,
                "cliente_id": cliente.id,
                "email": email,
                "nome": data.get("nome"),
                "empresa_id": empresa.id,
                "empresa_nome": empresa_data.get("nome"),
                "perfil": "cliente"
            }

    raise HTTPException(status_code=404, detail="Usuário não encontrado")