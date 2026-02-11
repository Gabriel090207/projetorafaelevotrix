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

    # rede
    pppoe_user: str | None = None
    pppoe_password: str | None = None
    ip_address: str | None = None
    conexao_status: str | None = "offline"




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


from datetime import datetime


@router.post("/conectar/{cliente_id}")
def conectar_cliente(cliente_id: str):
    ref = db.collection("clientes").document(cliente_id)
    doc = ref.get()

    if not doc.exists:
        raise HTTPException(404, "Cliente não encontrado")

    ref.update({
        "conexao_status": "online",
        "ip_address": "100.64.10.10",
        "conectado_em": datetime.utcnow().isoformat()
    })

    return {"message": "Cliente conectado"}
