from fastapi import APIRouter, HTTPException
from app.core.firebase import db

from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/clientes", tags=["Clientes"])

# Banco temporário em memória
CLIENTES = []
NEXT_ID = 1

class Cliente(BaseModel):
    nome: str
    documento: str
    telefone: str
    email: str
    endereco: str
    plano_id: str | None = None



@router.post("/")
def criar_cliente(cliente: Cliente):
    data = cliente.dict()

    doc_ref = db.collection("clientes").add(data)

    return {"message": "Cliente criado"}


@router.get("/")
def listar_clientes():
    docs = db.collection("clientes").stream()

    clientes = []
    for doc in docs:
        c = doc.to_dict()
        c["id"] = doc.id
        clientes.append(c)

    return clientes


@router.get("/{cliente_id}")
def buscar_cliente(cliente_id: int):
    for c in CLIENTES:
        if c["id"] == cliente_id:
            return c

    raise HTTPException(404, "Cliente não encontrado")

@router.delete("/{cliente_id}")
def deletar_cliente(cliente_id: int):
    global CLIENTES
    CLIENTES = [c for c in CLIENTES if c["id"] != cliente_id]
    return {"message": "Cliente removido"}
