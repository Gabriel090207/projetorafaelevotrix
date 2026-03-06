from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from app.core.firebase import db

router = APIRouter(prefix="/gateways", tags=["Gateways"])


class GatewayInput(BaseModel):
    empresa_id: str
    tipo: str
    nome: str
    config: dict
    ativo: bool = True


def now():
    return datetime.utcnow().isoformat()


# ==============================
# SALVAR GATEWAY
# ==============================

@router.post("/")
def salvar_gateway(dados: GatewayInput):

    gateways_ref = (
        db.collection("empresas")
        .document(dados.empresa_id)
        .collection("gateways")
    )

    docs = (
        gateways_ref
        .where("tipo", "==", dados.tipo)
        .stream()
    )

    existente = None
    for doc in docs:
        existente = doc

    gateway_data = {
        "empresa_id": dados.empresa_id,
        "tipo": dados.tipo,
        "nome": dados.nome,
        "config": dados.config,
        "ativo": dados.ativo,
        "atualizado_em": now()
    }

    if existente:
        gateways_ref.document(existente.id).update(gateway_data)
        return {"message": "Gateway atualizado com sucesso"}
    else:
        gateway_data["criado_em"] = now()
        gateways_ref.add(gateway_data)
        return {"message": "Gateway criado com sucesso"}


# ==============================
# LISTAR GATEWAYS
# ==============================

@router.get("/{empresa_id}")
def listar_gateways(empresa_id: str):

    docs = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("gateways")
        .stream()
    )

    lista = []

    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        lista.append(data)

    return lista