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

@router.get("/online")
def clientes_online():
    docs = db.collection("clientes") \
        .where("conexao_status", "==", "online") \
        .stream()

    clientes = []

    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        clientes.append(data)

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


import random


@router.post("/trafego/{cliente_id}")
def atualizar_trafego(cliente_id: str):
    ref = db.collection("clientes").document(cliente_id)
    doc = ref.get()

    if not doc.exists:
        raise HTTPException(404, "Cliente não encontrado")

    download = round(random.uniform(5, 100), 2)
    upload = round(random.uniform(2, 50), 2)

    ref.update({
        "download_mbps": download,
        "upload_mbps": upload,
        "trafego_atualizado_em": datetime.utcnow().isoformat()
    })

    return {
        "download_mbps": download,
        "upload_mbps": upload
    }

@router.post("/trafego-online")
def atualizar_trafego_online():
    docs = db.collection("clientes") \
        .where("conexao_status", "==", "online") \
        .stream()

    atualizados = 0

    for doc in docs:
        cliente_id = doc.id

        download = round(random.uniform(5, 100), 2)
        upload = round(random.uniform(2, 50), 2)

        db.collection("clientes").document(cliente_id).update({
            "download_mbps": download,
            "upload_mbps": upload,
            "trafego_atualizado_em": datetime.utcnow().isoformat()
        })

        atualizados += 1

    return {
        "clientes_atualizados": atualizados
    }
