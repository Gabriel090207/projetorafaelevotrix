from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from app.core.firebase import db

router = APIRouter(prefix="/cobrancas", tags=["Cobranças"])


# ==============================
# GERAR COBRANÇA INDIVIDUAL
# ==============================
@router.post("/gerar/{cliente_id}")
def gerar_cobranca(cliente_id: str):
    cliente_ref = db.collection("clientes").document(cliente_id).get()

    if not cliente_ref.exists:
        raise HTTPException(404, "Cliente não encontrado")

    cliente = cliente_ref.to_dict()

    # Evitar cobrança duplicada no mês
    agora = datetime.utcnow()
    inicio_mes = datetime(agora.year, agora.month, 1)

    docs = db.collection("cobrancas") \
        .where("cliente_id", "==", cliente_id) \
        .stream()

    for doc in docs:
        data = doc.to_dict()
        data_criacao = datetime.fromisoformat(data["data_criacao"])

        if data_criacao >= inicio_mes:
            raise HTTPException(
                400,
                "Cobrança já existe para este cliente neste mês"
            )

    plano_id = cliente.get("plano_id")
    if not plano_id:
        raise HTTPException(400, "Cliente sem plano")

    plano_ref = db.collection("planos").document(plano_id).get()

    if not plano_ref.exists:
        raise HTTPException(404, "Plano não encontrado")

    plano = plano_ref.to_dict()

    vencimento = datetime.utcnow() + timedelta(days=30)

    cobranca = {
        "cliente_id": cliente_id,
        "cliente_nome": cliente["nome"],
        "valor": plano["valor"],
        "status": "pendente",
        "data_criacao": datetime.utcnow().isoformat(),
        "data_vencimento": vencimento.isoformat(),

        # campos para integração bancária
        "gateway": None,
        "gateway_id": None,
        "linha_digitavel": None,
        "pix_qrcode": None,
        "pix_copia_cola": None,
        "status_gateway": None
    }

    db.collection("cobrancas").add(cobranca)

    return {"message": "Cobrança gerada"}


# ==============================
# LISTAR COBRANÇAS
# ==============================
@router.get("/")
def listar_cobrancas():
    docs = db.collection("cobrancas").stream()

    cobrancas = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        cobrancas.append(data)

    return cobrancas


# ==============================
# MARCAR COMO PAGA
# ==============================
@router.put("/pagar/{cobranca_id}")
def pagar_cobranca(cobranca_id: str):
    ref = db.collection("cobrancas").document(cobranca_id)

    if not ref.get().exists:
        raise HTTPException(404, "Cobrança não encontrada")

    ref.update({"status": "pago"})

    return {"message": "Cobrança marcada como paga"}


# ==============================
# GERAR COBRANÇAS MENSAIS
# ==============================
@router.post("/gerar-mensal")
def gerar_cobrancas_mensais():
    clientes_docs = db.collection("clientes").stream()

    geradas = 0
    ignoradas = 0

    agora = datetime.utcnow()
    inicio_mes = datetime(agora.year, agora.month, 1)

    for cliente_doc in clientes_docs:
        cliente_id = cliente_doc.id
        cliente = cliente_doc.to_dict()

        plano_id = cliente.get("plano_id")
        if not plano_id:
            ignoradas += 1
            continue

        docs = db.collection("cobrancas") \
            .where("cliente_id", "==", cliente_id) \
            .stream()

        ja_existe = False

        for doc in docs:
            data = doc.to_dict()
            data_criacao = datetime.fromisoformat(data["data_criacao"])

            if data_criacao >= inicio_mes:
                ja_existe = True
                break

        if ja_existe:
            ignoradas += 1
            continue

        plano_ref = db.collection("planos").document(plano_id).get()
        if not plano_ref.exists:
            ignoradas += 1
            continue

        plano = plano_ref.to_dict()

        vencimento = datetime.utcnow() + timedelta(days=30)

        cobranca = {
            "cliente_id": cliente_id,
            "cliente_nome": cliente["nome"],
            "valor": plano["valor"],
            "status": "pendente",
            "data_criacao": datetime.utcnow().isoformat(),
            "data_vencimento": vencimento.isoformat(),

            "gateway": None,
            "gateway_id": None,
            "linha_digitavel": None,
            "pix_qrcode": None,
            "pix_copia_cola": None,
            "status_gateway": None
        }

        db.collection("cobrancas").add(cobranca)
        geradas += 1

    return {
        "cobrancas_geradas": geradas,
        "clientes_ignorados": ignoradas
    }


# ==============================
# RÉGUA DE COBRANÇA
# ==============================
@router.get("/regua")
def regua_cobranca():
    docs = db.collection("cobrancas").stream()

    agora = datetime.utcnow()
    avisos = []

    for doc in docs:
        data = doc.to_dict()
        vencimento = datetime.fromisoformat(data["data_vencimento"])

        dias_restantes = (vencimento - agora).days

        if data["status"] == "pago":
            continue

        status_regua = None

        if dias_restantes <= -5:
            status_regua = "atraso_5_dias"
        elif dias_restantes < 0:
            status_regua = "vencida"
        elif dias_restantes <= 3:
            status_regua = "vence_em_breve"

        if status_regua:
            data["id"] = doc.id
            data["regua_status"] = status_regua
            avisos.append(data)

    return avisos


import uuid


@router.post("/gerar-pix/{cobranca_id}")
def gerar_pix(cobranca_id: str):
    ref = db.collection("cobrancas").document(cobranca_id)
    doc = ref.get()

    if not doc.exists:
        raise HTTPException(404, "Cobrança não encontrada")

    pix_code = f"PIX-{uuid.uuid4().hex}"

    ref.update({
        "gateway": "PIX_TESTE",
        "pix_copia_cola": pix_code,
        "status_gateway": "gerado"
    })

    return {
        "message": "PIX gerado",
        "pix_code": pix_code
    }


@router.post("/confirmar-pagamento/{cobranca_id}")
def confirmar_pagamento(cobranca_id: str):
    ref = db.collection("cobrancas").document(cobranca_id)
    doc = ref.get()

    if not doc.exists:
        raise HTTPException(404, "Cobrança não encontrada")

    dados = doc.to_dict()
    cliente_id = dados["cliente_id"]

    ref.update({
        "status": "pago",
        "status_gateway": "pago",
        "data_pagamento": datetime.utcnow().isoformat()
    })

    # desbloqueia cliente
    db.collection("clientes").document(cliente_id).update({
        "status": "ativo"
    })


    return {"message": "Pagamento confirmado"}


@router.post("/bloqueio-automatico")
def bloqueio_automatico():
    docs = db.collection("cobrancas").stream()

    agora = datetime.utcnow()
    clientes_bloqueados = 0

    for doc in docs:
        data = doc.to_dict()

        if data["status"] == "pago":
            continue

        vencimento = datetime.fromisoformat(data["data_vencimento"])
        dias_atraso = (agora - vencimento).days

        if dias_atraso >= 5:
            cliente_id = data["cliente_id"]

            db.collection("clientes").document(cliente_id).update({
                "status": "bloqueado"
            })

            clientes_bloqueados += 1

    return {
        "clientes_bloqueados": clientes_bloqueados
    }
