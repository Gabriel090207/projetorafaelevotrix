from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from app.core.firebase import db
from app.core.deps import require_empresa_access

router = APIRouter(prefix="/planos", tags=["Planos"])


# =========================
# Models
# =========================
class PlanoCreate(BaseModel):
    nome: str = Field(..., min_length=2)
    velocidade_download: int = Field(..., ge=1)
    velocidade_upload: int = Field(..., ge=1)
    valor: float = Field(..., ge=0)


class PlanoUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=2)
    velocidade_download: Optional[int] = Field(None, ge=1)
    velocidade_upload: Optional[int] = Field(None, ge=1)
    valor: Optional[float] = Field(None, ge=0)
    ativo: Optional[bool] = None


def _now():
    return datetime.utcnow().isoformat()


def planos_ref(empresa_id: str):
    return db.collection("empresas").document(empresa_id).collection("planos")


# =========================
# Routes (multiempresa)
# =========================

@router.post("")
def criar_plano(plano: PlanoCreate, ctx=Depends(require_empresa_access)):
    empresa_id = ctx["empresa_id"]

    data = plano.dict()
    data.update({
        "empresa_id": empresa_id,
        "ativo": True,
        "criado_em": _now(),
        "atualizado_em": _now(),
    })

    doc_ref = planos_ref(empresa_id).document()
    doc_ref.set(data)

    return {"ok": True, "id": doc_ref.id}


@router.get("")
def listar_planos(ctx=Depends(require_empresa_access)):
    empresa_id = ctx["empresa_id"]

    docs = planos_ref(empresa_id).stream()

    planos = []
    for doc in docs:
        d = doc.to_dict() or {}
        d["id"] = doc.id
        planos.append(d)

    # opcional: ordenar por nome
    planos.sort(key=lambda x: (x.get("nome") or "").lower())

    return planos


@router.get("/{plano_id}")
def obter_plano(plano_id: str, ctx=Depends(require_empresa_access)):
    empresa_id = ctx["empresa_id"]

    doc = planos_ref(empresa_id).document(plano_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Plano não encontrado")

    data = doc.to_dict() or {}
    data["id"] = doc.id
    return data


@router.put("/{plano_id}")
def atualizar_plano(plano_id: str, patch: PlanoUpdate, ctx=Depends(require_empresa_access)):
    empresa_id = ctx["empresa_id"]

    ref = planos_ref(empresa_id).document(plano_id)
    doc = ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Plano não encontrado")

    payload = {k: v for k, v in patch.dict().items() if v is not None}
    if not payload:
        return {"ok": True, "message": "Nada para atualizar"}

    payload["atualizado_em"] = _now()
    ref.set(payload, merge=True)

    return {"ok": True}


@router.delete("/{plano_id}")
def deletar_plano(plano_id: str, ctx=Depends(require_empresa_access)):
    empresa_id = ctx["empresa_id"]

    ref = planos_ref(empresa_id).document(plano_id)
    doc = ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Plano não encontrado")

    ref.delete()
    return {"ok": True}