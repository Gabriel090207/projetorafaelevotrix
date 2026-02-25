from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from datetime import datetime
from app.core.firebase import db
from app.core.firebase_auth import verify_firebase_token
import uuid

router = APIRouter(prefix="/auth", tags=["Auth"])

security = HTTPBearer()


# =========================
# DEPENDÊNCIA PARA VALIDAR TOKEN FIREBASE
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

    # Verifica se usuário já existe
    user_doc = db.collection("usuarios").document(uid).get()

    if user_doc.exists:
        data = user_doc.to_dict()
        return {
            "message": "Usuário já existente",
            "empresa_id": data["empresa_id"],
            "perfil": data["perfil"]
        }

    # =========================
    # PRIMEIRO LOGIN → CRIAR EMPRESA
    # =========================
    empresa_id = str(uuid.uuid4())

    db.collection("empresas").document(empresa_id).set({
        "nome": dados.empresa_nome,
        "plano": "trial",
        "status": "ativa",
        "cnpj": "",
        "telefone": "",
        "email": "",
        "endereco": "",
        "criado_em": datetime.utcnow().isoformat()
    })

    # Criar usuário admin
    db.collection("usuarios").document(uid).set({
        "nome": nome,
        "email": email,
        "empresa_id": empresa_id,
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
# ROTA PARA PEGAR DADOS DO USUÁRIO LOGADO
# =========================
@router.get("/me")
def get_me(user=Depends(get_current_user)):

    uid = user["uid"]

    user_doc = db.collection("usuarios").document(uid).get()

    if not user_doc.exists:
        raise HTTPException(404, "Usuário não encontrado")

    data = user_doc.to_dict()

    return {
        "uid": uid,
        "email": user.get("email"),
        "empresa_id": data["empresa_id"],
        "perfil": data["perfil"]
    }