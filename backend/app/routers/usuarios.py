from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, EmailStr
from firebase_admin import firestore
from app.routers.auth import get_current_user

router = APIRouter(prefix="/usuarios", tags=["Usuários"])
db = firestore.client()


class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    perfil: str
    senha: str
    ativo: bool = True


# =========================
# LISTAR USUÁRIOS DA EMPRESA
# =========================
@router.get("/")
def listar_usuarios(
    user=Depends(get_current_user),
    empresa_id: str = Header(None, alias="X-Empresa-Id")
):

    if not empresa_id:
        raise HTTPException(status_code=400, detail="Empresa não informada")

    usuarios_ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("usuarios")
    )

    docs = usuarios_ref.stream()

    usuarios = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        usuarios.append(data)

    return usuarios


# =========================
# CRIAR USUÁRIO
# =========================
@router.post("/")
def criar_usuario(
    usuario: UsuarioCreate,
    user=Depends(get_current_user),
    empresa_id: str = Header(None, alias="X-Empresa-Id")
):

    if not empresa_id:
        raise HTTPException(status_code=400, detail="Empresa não informada")

    novo_usuario_ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("usuarios")
        .document()
    )

    novo_usuario_ref.set({
        "nome": usuario.nome,
        "email": usuario.email,
        "perfil": usuario.perfil,
        "ativo": usuario.ativo,
        "criado_em": firestore.SERVER_TIMESTAMP
    })

    return {"msg": "Usuário criado com sucesso"}