from fastapi import APIRouter
from pydantic import BaseModel
from app.core.firebase import db

router = APIRouter(prefix="/planos", tags=["Planos"])

class Plano(BaseModel):
    nome: str
    velocidade_download: int
    velocidade_upload: int
    valor: float

@router.post("/")
def criar_plano(plano: Plano):
    data = plano.dict()
    db.collection("planos").add(data)
    return {"message": "Plano criado"}

@router.get("/")
def listar_planos():
    docs = db.collection("planos").stream()

    planos = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        planos.append(data)

    return planos
