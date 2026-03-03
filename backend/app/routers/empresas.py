from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from datetime import datetime
from app.core.firebase import db
from app.core.firebase_auth import verify_firebase_token

router = APIRouter(prefix="/empresas", tags=["Empresas"])
security = HTTPBearer()


# =========================
# DEPENDÊNCIA TOKEN
# =========================
def get_current_user(credentials=Depends(security)):
    try:
        return verify_firebase_token(credentials.credentials)
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")


# =========================
# MODELO UPDATE COMPLETO
# =========================
class EmpresaUpdate(BaseModel):
    nome: str
    cnpj: str | None = None
    telefone: str | None = None
    email: str | None = None
    endereco: str | None = None


# =========================
# BUSCAR EMPRESA LOGADA
# =========================
@router.get("/me")
def get_empresa(user=Depends(get_current_user)):

    uid = user["uid"]

    empresas = db.collection("empresas").stream()

    for empresa in empresas:

        user_doc = empresa.reference.collection("usuarios").document(uid).get()

        if user_doc.exists:

            empresa_doc = empresa.reference.get()

            data = empresa_doc.to_dict()
            data["id"] = empresa_doc.id

            return data

    raise HTTPException(404, "Empresa não encontrada")

# =========================
# ATUALIZAR EMPRESA
# =========================
@router.put("/me")
def update_empresa(dados: EmpresaUpdate, user=Depends(get_current_user)):

    uid = user["uid"]

    empresas = db.collection("empresas").stream()

    for empresa in empresas:

        user_doc = empresa.reference.collection("usuarios").document(uid).get()

        if user_doc.exists:

            empresa_ref = empresa.reference

            update_data = {
                "nome": dados.nome,
                "cnpj": dados.cnpj,
                "telefone": dados.telefone,
                "email": dados.email,
                "endereco": dados.endereco,
                "atualizado_em": datetime.utcnow().isoformat()
            }

            empresa_ref.update(update_data)

            return {"message": "Empresa atualizada com sucesso"}

    raise HTTPException(404, "Empresa não encontrada")