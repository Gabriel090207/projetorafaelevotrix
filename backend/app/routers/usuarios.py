from fastapi import APIRouter, Depends, HTTPException
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
def listar_usuarios(user=Depends(get_current_user)):

    uid = user["uid"]

    # Buscar usuário global
    user_doc = db.collection("usuarios").document(uid).get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    user_data = user_doc.to_dict()
    empresa_id = user_data["empresa_id"]

    # Buscar usuários da mesma empresa (coleção GLOBAL filtrada)
    usuarios_ref = (
        db.collection("usuarios")
        .where("empresa_id", "==", empresa_id)
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
def criar_usuario(usuario: UsuarioCreate, user=Depends(get_current_user)):

    uid = user["uid"]

    # Buscar usuário global logado
    user_doc = db.collection("usuarios").document(uid).get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    user_data = user_doc.to_dict()
    empresa_id = user_data["empresa_id"]

    # Criar novo usuário GLOBAL
    novo_usuario_ref = db.collection("usuarios").document()

    novo_usuario_ref.set({
        "nome": usuario.nome,
        "email": usuario.email,
        "perfil": usuario.perfil,
        "ativo": usuario.ativo,
        "empresa_id": empresa_id,
        "criado_em": firestore.SERVER_TIMESTAMP
    })

    return {"msg": "Usuário criado com sucesso"}