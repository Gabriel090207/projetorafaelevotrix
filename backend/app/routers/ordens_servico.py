from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from uuid import uuid4
from datetime import datetime

from app.core.firebase import db

router = APIRouter(
    prefix="/ordens-servico",
    tags=["Ordens de Serviço"]
)


# =====================================================
# 📦 MODELOS
# =====================================================

class OrdemServicoCreate(BaseModel):
    empresa_id: str
    cliente_id: str
    tecnico_id: str
    descricao: str


class OrdemServicoResponse(BaseModel):
    id: str
    cliente_nome: str
    tecnico_nome: str
    status: str
    descricao: str
    data_abertura: datetime


# =====================================================
# 🔥 CRIAR ORDEM DE SERVIÇO
# =====================================================

@router.post("/", response_model=OrdemServicoResponse)
def criar_ordem_servico(dados: OrdemServicoCreate):

    empresa_ref = db.collection("empresas").document(dados.empresa_id)

    # 🔎 VALIDAR CLIENTE
    cliente_ref = empresa_ref.collection("clientes").document(dados.cliente_id)
    cliente_doc = cliente_ref.get()

    if not cliente_doc.exists:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    cliente_data = cliente_doc.to_dict()

    # 🔎 VALIDAR TÉCNICO
    tecnico_ref = empresa_ref.collection("tecnicos").document(dados.tecnico_id)
    tecnico_doc = tecnico_ref.get()

    if not tecnico_doc.exists:
        raise HTTPException(status_code=404, detail="Técnico não encontrado")

    tecnico_data = tecnico_doc.to_dict()

    os_id = str(uuid4())

    nova_os = {
        "id": os_id,
        "cliente_id": dados.cliente_id,
        "cliente_nome": cliente_data.get("nome"),
        "tecnico_id": dados.tecnico_id,
        "tecnico_nome": tecnico_data.get("nome"),
        "descricao": dados.descricao,
        "status": "ABERTA",
        "data_abertura": datetime.utcnow(),
        "criado_em": datetime.utcnow()
    }

    empresa_ref.collection("ordens_servico").document(os_id).set(nova_os)

    return nova_os


# =====================================================
# 📄 LISTAR OS POR EMPRESA
# =====================================================

@router.get("/empresa/{empresa_id}", response_model=List[OrdemServicoResponse])
def listar_ordens_servico(empresa_id: str):

    ordens_ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("ordens_servico")
        .stream()
    )

    ordens = []

    for doc in ordens_ref:
        ordens.append(doc.to_dict())

    return ordens


# =====================================================
# 🔄 ALTERAR STATUS
# =====================================================

@router.patch("/{empresa_id}/{os_id}/status/{novo_status}")
def alterar_status_os(
    empresa_id: str,
    os_id: str,
    novo_status: str
):

    os_ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("ordens_servico")
        .document(os_id)
    )

    os_doc = os_ref.get()

    if not os_doc.exists:
        raise HTTPException(status_code=404, detail="OS não encontrada")

    os_ref.update({
        "status": novo_status,
        "atualizado_em": datetime.utcnow()
    })

    return {"message": "Status atualizado"}


# =====================================================
# ✅ CONCLUIR OS
# =====================================================

@router.patch("/{empresa_id}/{os_id}/concluir")
def concluir_os(empresa_id: str, os_id: str):

    os_ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("ordens_servico")
        .document(os_id)
    )

    os_doc = os_ref.get()

    if not os_doc.exists:
        raise HTTPException(status_code=404, detail="OS não encontrada")

    os_ref.update({
        "status": "CONCLUIDA",
        "concluido_em": datetime.utcnow()
    })

    return {"message": "OS concluída com sucesso"}


# =====================================================
# ❌ CANCELAR OS
# =====================================================

@router.patch("/{empresa_id}/{os_id}/cancelar")
def cancelar_os(empresa_id: str, os_id: str):

    os_ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("ordens_servico")
        .document(os_id)
    )

    os_doc = os_ref.get()

    if not os_doc.exists:
        raise HTTPException(status_code=404, detail="OS não encontrada")

    os_ref.update({
        "status": "CANCELADA",
        "cancelado_em": datetime.utcnow()
    })

    return {"message": "OS cancelada com sucesso"}