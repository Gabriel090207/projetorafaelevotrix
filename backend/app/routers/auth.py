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
# SINCRONIZAR USUÁRIO
# =========================
@router.post("/sync-user")
def sync_user(user=Depends(get_current_user)):

    uid = user["uid"]
    email = user.get("email")
    nome = user.get("name", email.split("@")[0])

    empresas_ref = db.collection("empresas")

    # =========================
    # VERIFICAR SE USUÁRIO JÁ EXISTE EM ALGUMA EMPRESA
    # =========================
    for empresa in empresas_ref.stream():
        user_doc = empresa.reference.collection("usuarios").document(uid).get()

        if user_doc.exists:
            data = user_doc.to_dict()

            return {
                "message": "Usuário já existente",
                "empresa_id": empresa.id,
                "perfil": data.get("perfil", "usuario")
            }

    # =========================
    # PRIMEIRO LOGIN → CRIAR EMPRESA
    # =========================
    empresa_id = str(uuid.uuid4())

    # Criar empresa
    db.collection("empresas").document(empresa_id).set({
        "nome": f"{nome} Telecom",
        "plano": "trial",
        "status": "ativa",
        "cnpj": "",
        "telefone": "",
        "email": email,
        "endereco": "",
        "criado_em": datetime.utcnow().isoformat()
    })

    # Criar usuário ADMIN dentro da empresa
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
        "message": "Usuário criado com sucesso",
        "empresa_id": empresa_id,
        "perfil": "admin"
    }


# =========================
# PEGAR DADOS DO USUÁRIO LOGADO
# =========================
@router.get("/me")
def get_me(user=Depends(get_current_user)):

    uid = user["uid"]

    empresas_ref = db.collection("empresas")

    for empresa in empresas_ref.stream():
        user_doc = empresa.reference.collection("usuarios").document(uid).get()

        if user_doc.exists:
            data = user_doc.to_dict()

            return {
                "uid": uid,
                "email": user.get("email"),
                "empresa_id": empresa.id,
                "perfil": data.get("perfil", "usuario")
            }

    raise HTTPException(404, "Usuário não encontrado")