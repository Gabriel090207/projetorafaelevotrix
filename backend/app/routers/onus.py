from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.core.firebase import db
from app.core.deps import require_empresa_access

router = APIRouter(prefix="/onus", tags=["ONUs"])


class ONUCreate(BaseModel):
    olt_id: str
    pon_id: str
    pon_porta: int
    serial: str
    modelo: Optional[str] = None
    cliente_id: Optional[str] = None


def onus_ref(empresa_id: str):
    return (
        db.collection("empresas")
        .document(empresa_id)
        .collection("onus")
    )


@router.post("")
def criar_onu(dados: ONUCreate, ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    ref = onus_ref(empresa_id).document()

    ref.set({
        "olt_id": dados.olt_id,
        "pon_id": dados.pon_id,
        "pon_porta": dados.pon_porta,
        "serial": dados.serial,
        "modelo": dados.modelo,
        "cliente_id": dados.cliente_id,
        "status": "offline"
    })

    return {"ok": True, "id": ref.id}


@router.get("/pon/{pon_id}")
def listar_onus_pon(pon_id: str, ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    docs = (
        onus_ref(empresa_id)
        .where("pon_id", "==", pon_id)
        .stream()
    )

    onus = []

    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        onus.append(d)

    return onus


@router.get("/{onu_id}")
def obter_onu(onu_id: str, ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    ref = onus_ref(empresa_id).document(onu_id)
    doc = ref.get()

    if not doc.exists:
        raise HTTPException(404, "ONU não encontrada")

    data = doc.to_dict()
    data["id"] = doc.id

    return data


@router.post("/{onu_id}/status")
def atualizar_status_onu(
    onu_id: str,
    potencia_rx: float,
    potencia_tx: float,
    temperatura: float,
    uptime: int,
    status: str,
    ctx=Depends(require_empresa_access)
):

    empresa_id = ctx["empresa_id"]

    ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("onus")
        .document(onu_id)
    )

    doc = ref.get()

    if not doc.exists:
        raise HTTPException(404, "ONU não encontrada")

    ref.update({
        "potencia_rx": potencia_rx,
        "potencia_tx": potencia_tx,
        "temperatura": temperatura,
        "uptime": uptime,
        "status": status
    })

    return {"ok": True}


@router.post("/{onu_id}/vincular-cliente/{cliente_id}")
def vincular_cliente_onu(onu_id: str, cliente_id: str, ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    onu_ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("onus")
        .document(onu_id)
    )

    onu_doc = onu_ref.get()

    if not onu_doc.exists:
        raise HTTPException(404, "ONU não encontrada")

    cliente_ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("clientes")
        .document(cliente_id)
    )

    cliente_doc = cliente_ref.get()

    if not cliente_doc.exists:
        raise HTTPException(404, "Cliente não encontrado")

    # Atualiza ONU
    onu_ref.update({
        "cliente_id": cliente_id
    })

    # Atualiza cliente
    cliente_ref.update({
        "onu_id": onu_id
    })

    return {
        "ok": True,
        "message": "Cliente vinculado à ONU"
    }