from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.core.firebase import db
from app.core.deps import require_empresa_access

router = APIRouter(prefix="/olts", tags=["OLTs"])


class OLTCreate(BaseModel):
    nome: str
    ip: str
    fabricante: Optional[str] = None
    modelo: Optional[str] = None
    usuario: Optional[str] = None
    senha: Optional[str] = None
    porta_api: Optional[int] = None


def olts_ref(empresa_id: str):
    return (
        db.collection("empresas")
        .document(empresa_id)
        .collection("olts")
    )


@router.post("")
def criar_olt(dados: OLTCreate, ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    ref = olts_ref(empresa_id).document()

    ref.set({
        "nome": dados.nome,
        "ip": dados.ip,
        "fabricante": dados.fabricante,
        "modelo": dados.modelo,
        "usuario": dados.usuario,
        "senha": dados.senha,
        "porta_api": dados.porta_api,
    })

    return {"ok": True, "id": ref.id}


@router.get("")
def listar_olts(ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    docs = olts_ref(empresa_id).stream()

    olts = []

    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        olts.append(d)

    return olts


@router.get("/{olt_id}")
def obter_olt(olt_id: str, ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    ref = olts_ref(empresa_id).document(olt_id)
    doc = ref.get()

    if not doc.exists:
        raise HTTPException(404, "OLT não encontrada")

    data = doc.to_dict()
    data["id"] = doc.id

    return data