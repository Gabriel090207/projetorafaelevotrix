from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.core.firebase import db
from app.core.deps import require_empresa_access

router = APIRouter(prefix="/pons", tags=["PONs"])


class PONCreate(BaseModel):
    olt_id: str
    numero: int
    descricao: Optional[str] = None


def pons_ref(empresa_id: str):
    return (
        db.collection("empresas")
        .document(empresa_id)
        .collection("pons")
    )


@router.post("")
def criar_pon(dados: PONCreate, ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    ref = pons_ref(empresa_id).document()

    ref.set({
        "olt_id": dados.olt_id,
        "numero": dados.numero,
        "descricao": dados.descricao
    })

    return {"ok": True, "id": ref.id}


@router.get("/olt/{olt_id}")
def listar_pons_por_olt(olt_id: str, ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    docs = (
        pons_ref(empresa_id)
        .where("olt_id", "==", olt_id)
        .stream()
    )

    pons = []

    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        pons.append(d)

    return pons