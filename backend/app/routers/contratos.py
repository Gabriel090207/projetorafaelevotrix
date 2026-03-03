from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4
from datetime import datetime, timedelta
from app.core.firebase import db

router = APIRouter(prefix="/contratos", tags=["Contratos"])


# =====================================================
# 📦 MODELOS
# =====================================================

class ContratoCreate(BaseModel):
    empresa_id: str
    cliente_id: str
    plano_id: str
    valor_mensal: float
    data_inicio: datetime
    fidelidade_meses: int = 0
    multa_rescisao: float = 0.0

    # 🔌 DADOS DE CONEXÃO
    tipo_conexao: str
    pppoe_usuario: Optional[str] = None
    pppoe_senha: Optional[str] = None
    mac_address: Optional[str] = None
    ip_fixo: Optional[str] = None
    onu_serial: Optional[str] = None
    olt_porta: Optional[str] = None


class ContratoResponse(BaseModel):
    id: str
    numero: str
    cliente_id: str
    cliente_nome: str
    plano_id: str
    plano_nome: str
    valor_mensal: float
    data_inicio: datetime
    fidelidade_meses: int
    multa_rescisao: float
    status: str


# =====================================================
# 🔥 CRIAR CONTRATO
# =====================================================

@router.post("/", response_model=ContratoResponse)
def criar_contrato(dados: ContratoCreate):

    empresa_ref = db.collection("empresas").document(dados.empresa_id)

    # 🔒 VERIFICAR CONTRATO ATIVO
    contratos_ativos = (
        empresa_ref
        .collection("contratos")
        .where("cliente_id", "==", dados.cliente_id)
        .where("status", "==", "ATIVO")
        .stream()
    )

    if any(contratos_ativos):
        raise HTTPException(
            status_code=400,
            detail="Cliente já possui contrato ativo"
        )

    # 🔎 VALIDAR CLIENTE
    cliente_ref = empresa_ref.collection("clientes").document(dados.cliente_id)
    cliente_doc = cliente_ref.get()

    if not cliente_doc.exists:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    cliente_data = cliente_doc.to_dict()

    # 🔎 VALIDAR PLANO
    plano_ref = empresa_ref.collection("planos").document(dados.plano_id)
    plano_doc = plano_ref.get()

    if not plano_doc.exists:
        raise HTTPException(status_code=404, detail="Plano não encontrado")

    plano_data = plano_doc.to_dict()

    # 🔢 GERAR NÚMERO DO CONTRATO
    contratos_stream = empresa_ref.collection("contratos").stream()
    total_contratos = len(list(contratos_stream)) + 1
    numero_contrato = f"CT-{str(total_contratos).zfill(6)}"

    contrato_id = str(uuid4())

    novo_contrato = {
        "id": contrato_id,
        "numero": numero_contrato,
        "cliente_id": dados.cliente_id,
        "cliente_nome": cliente_data.get("nome"),
        "plano_id": dados.plano_id,
        "plano_nome": plano_data.get("nome"),
        "valor_mensal": dados.valor_mensal,
        "data_inicio": dados.data_inicio,
        "fidelidade_meses": dados.fidelidade_meses,
        "multa_rescisao": dados.multa_rescisao,
        "status": "ATIVO",

        "conexao": {
            "tipo": dados.tipo_conexao,
            "pppoe_usuario": dados.pppoe_usuario,
            "pppoe_senha": dados.pppoe_senha,
            "mac_address": dados.mac_address,
            "ip_fixo": dados.ip_fixo,
            "onu_serial": dados.onu_serial,
            "olt_porta": dados.olt_porta,
            "status_online": False
        },

        "criado_em": datetime.utcnow()
    }

    # 💾 SALVAR CONTRATO
    empresa_ref.collection("contratos").document(contrato_id).set(novo_contrato)

    # =====================================================
    # 💰 GERAR PRIMEIRA COBRANÇA AUTOMÁTICA
    # =====================================================

    cobranca_id = str(uuid4())

    nova_cobranca = {
        "id": cobranca_id,
        "contrato_id": contrato_id,
        "cliente_id": dados.cliente_id,
        "cliente_nome": cliente_data.get("nome"),
        "valor": dados.valor_mensal,
        "vencimento": dados.data_inicio,
        "status": "PENDENTE",
        "tipo": "MENSALIDADE",
        "criado_em": datetime.utcnow()
    }

    empresa_ref.collection("cobrancas").document(cobranca_id).set(nova_cobranca)

    return novo_contrato


# =====================================================
# 📄 LISTAR CONTRATOS POR EMPRESA
# =====================================================

@router.get("/empresa/{empresa_id}", response_model=List[ContratoResponse])
def listar_contratos(empresa_id: str):

    contratos_ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("contratos")
        .stream()
    )

    contratos = []

    for doc in contratos_ref:
        contratos.append(doc.to_dict())

    return contratos


# =====================================================
# ❌ CANCELAR CONTRATO
# =====================================================

@router.patch("/{empresa_id}/{contrato_id}/cancelar")
def cancelar_contrato(empresa_id: str, contrato_id: str):

    contrato_ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("contratos")
        .document(contrato_id)
    )

    contrato = contrato_ref.get()

    if not contrato.exists:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")

    contrato_ref.update({
        "status": "CANCELADO",
        "cancelado_em": datetime.utcnow()
    })

    return {"message": "Contrato cancelado com sucesso"}