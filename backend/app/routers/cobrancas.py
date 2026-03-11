from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from app.core.firebase import db
import uuid
from app.services.gateway_service import GatewayService
from app.services.banco_bb_pix import BancoBBPix
from app.services.boleto_service import BoletoService

router = APIRouter(prefix="/cobrancas", tags=["Cobranças"])


# ==============================
# GERAR COBRANÇA INDIVIDUAL
# ==============================
@router.post("/gerar/{empresa_id}/{cliente_id}")
def gerar_cobranca(empresa_id: str, cliente_id: str):

    empresa_ref = db.collection("empresas").document(empresa_id)

    cliente_ref = (
        empresa_ref
        .collection("clientes")
        .document(cliente_id)
        .get()
    )

    if not cliente_ref.exists:
        raise HTTPException(404, "Cliente não encontrado")

    cliente = cliente_ref.to_dict()

    agora = datetime.utcnow()
    inicio_mes = datetime(agora.year, agora.month, 1)

    docs = (
        empresa_ref
        .collection("cobrancas")
        .where("cliente_id", "==", cliente_id)
        .stream()
    )

    for doc in docs:
        data = doc.to_dict()
        criado = data["criado_em"]

        if criado.replace(tzinfo=None) >= inicio_mes:
            raise HTTPException(
                400,
                "Cobrança já existe para este cliente neste mês"
            )

    contrato_id = cliente.get("contrato_id")

    if not contrato_id:
        raise HTTPException(400, "Cliente sem contrato")

    contrato_ref = (
        empresa_ref
        .collection("contratos")
        .document(contrato_id)
        .get()
    )

    contrato = contrato_ref.to_dict()

    vencimento = datetime.utcnow() + timedelta(days=30)

    cobranca_id = str(uuid.uuid4())

    cobranca = {
        "id": cobranca_id,
        "cliente_id": cliente_id,
        "cliente_nome": cliente["nome"],
        "contrato_id": contrato_id,
        "valor": contrato["valor_mensal"],
        "status": "PENDENTE",
        "tipo": "MENSALIDADE",
        "criado_em": datetime.utcnow(),
        "vencimento": vencimento,

        "gateway": None,
        "gateway_id": None,
        "linha_digitavel": None,
        "pix_qrcode": None,
        "pix_copia_cola": None,
        "status_gateway": None
    }

    empresa_ref.collection("cobrancas").document(cobranca_id).set(cobranca)

    return {"message": "Cobrança gerada"}


# ==============================
# LISTAR COBRANÇAS DA EMPRESA
# ==============================
@router.get("/empresa/{empresa_id}")
def listar_cobrancas_empresa(empresa_id: str):

    docs = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("cobrancas")
        .stream()
    )

    cobrancas = []

    for doc in docs:
        data = doc.to_dict()
        cobrancas.append(data)

    return cobrancas


# ==============================
# MARCAR COMO PAGA
# ==============================
@router.put("/pagar/{empresa_id}/{cobranca_id}")
def pagar_cobranca(empresa_id: str, cobranca_id: str):

    ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("cobrancas")
        .document(cobranca_id)
    )

    doc = ref.get()

    if not doc.exists:
        raise HTTPException(404, "Cobrança não encontrada")

    ref.update({
        "status": "PAGO",
        "data_pagamento": datetime.utcnow()
    })



    from app.services.mk_auth import MKAuth

    cliente_ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("clientes")
        .document(cliente_id)
    )

    cliente = cliente_ref.get().to_dict()

    login = cliente.get("login")

    try:

        mk = MKAuth(empresa_id)

        mk.liberar_cliente(login)

        cliente_ref.update({
            "status": "ATIVO"
        })

    except Exception as e:

        print(f"Erro liberar cliente {cliente_id}: {e}")

    return {"message": "Cobrança marcada como paga"}


# ==============================
# GERAR COBRANÇAS MENSAIS
# ==============================
@router.post("/gerar-mensal/{empresa_id}")
def gerar_cobrancas_mensais(empresa_id: str):

    empresa_ref = db.collection("empresas").document(empresa_id)

    contratos_docs = (
        empresa_ref
        .collection("contratos")
        .where("status", "==", "ATIVO")
        .stream()
    )

    geradas = 0
    ignoradas = 0

    agora = datetime.utcnow()
    inicio_mes = datetime(agora.year, agora.month, 1)

    for contrato_doc in contratos_docs:

        contrato = contrato_doc.to_dict()
        contrato_id = contrato["id"]
        cliente_id = contrato["cliente_id"]

        docs = (
            empresa_ref
            .collection("cobrancas")
            .where("contrato_id", "==", contrato_id)
            .stream()
        )

        ja_existe = False

        for doc in docs:
            data = doc.to_dict()
            criado = data["criado_em"]

            if criado.replace(tzinfo=None) >= inicio_mes:
                ja_existe = True
                break

        if ja_existe:
            ignoradas += 1
            continue

        cobranca_id = str(uuid.uuid4())

        cobranca = {
            "id": cobranca_id,
            "cliente_id": cliente_id,
            "cliente_nome": contrato["cliente_nome"],
            "contrato_id": contrato_id,
            "valor": contrato["valor_mensal"],
            "status": "PENDENTE",
            "tipo": "MENSALIDADE",
            "criado_em": datetime.utcnow(),
            "vencimento": agora + timedelta(days=30),

            "gateway": None,
            "gateway_id": None,
            "linha_digitavel": None,
            "pix_qrcode": None,
            "pix_copia_cola": None,
            "status_gateway": None
        }

        empresa_ref.collection("cobrancas").document(cobranca_id).set(cobranca)

        geradas += 1

    return {
        "cobrancas_geradas": geradas,
        "clientes_ignorados": ignoradas
    }


# ==============================
# RÉGUA DE COBRANÇA
# ==============================
@router.get("/regua/{empresa_id}")
def regua_cobranca(empresa_id: str):

    docs = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("cobrancas")
        .stream()
    )

    agora = datetime.utcnow()
    avisos = []

    for doc in docs:

        data = doc.to_dict()

        if data["status"] == "PAGO":
            continue

        vencimento = data["vencimento"]
        dias_restantes = (vencimento.replace(tzinfo=None) - agora).days

        status_regua = None

        if dias_restantes <= -5:
            status_regua = "atraso_5_dias"
        elif dias_restantes < 0:
            status_regua = "vencida"
        elif dias_restantes <= 3:
            status_regua = "vence_em_breve"

        if status_regua:
            data["regua_status"] = status_regua
            avisos.append(data)

    return avisos




from app.services.gateway_service import GatewayService
from app.services.banco_bb_pix import BancoBBPix


# ==============================
# GERAR PIX
# ==============================
@router.post("/gerar-pix/{empresa_id}/{cobranca_id}")
def gerar_pix(empresa_id: str, cobranca_id: str):

    ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("cobrancas")
        .document(cobranca_id)
    )

    doc = ref.get()

    if not doc.exists:
        raise HTTPException(404, "Cobrança não encontrada")

    cobranca = doc.to_dict()

    try:

        # ==============================
        # BUSCAR GATEWAY ATIVO
        # ==============================

        gateway = GatewayService(empresa_id)

        if gateway.tipo() == "banco_brasil":

            banco = BancoBBPix(empresa_id)

            pix = banco.gerar_pix(
                valor=cobranca["valor"],
                descricao=f"Mensalidade {cobranca['cliente_nome']}"
            )

            ref.update({
                "gateway": "BANCO_BRASIL",
                "pix_copia_cola": pix.get("pixCopiaECola"),
                "txid": pix.get("txid"),
                "status_gateway": "GERADO"
            })

            return {
                "message": "PIX gerado",
                "pix": pix
            }

        raise Exception("Gateway não suportado")

    except Exception as e:
        raise HTTPException(400, str(e))

# ==============================
# BLOQUEIO AUTOMÁTICO
# ==============================
@router.post("/bloqueio-automatico/{empresa_id}")
def bloqueio_automatico(empresa_id: str):

    empresa_ref = db.collection("empresas").document(empresa_id)

    docs = empresa_ref.collection("cobrancas").stream()

    agora = datetime.utcnow()
    clientes_bloqueados = 0

    for doc in docs:

        data = doc.to_dict()

        if data["status"] == "PAGO":
            continue

        vencimento = data["vencimento"]
        dias_atraso = (agora - vencimento.replace(tzinfo=None)).days

        if dias_atraso >= 5:

            cliente_id = data["cliente_id"]

            empresa_ref.collection("clientes").document(cliente_id).update({
                "status": "BLOQUEADO"
            })

            clientes_bloqueados += 1

    return {
        "clientes_bloqueados": clientes_bloqueados
    }

# ==============================
# GERAR BOLETO
# ==============================
@router.post("/gerar-boleto/{empresa_id}/{cobranca_id}")
def gerar_boleto(empresa_id: str, cobranca_id: str):

    ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("cobrancas")
        .document(cobranca_id)
    )

    doc = ref.get()

    if not doc.exists:
        raise HTTPException(404, "Cobrança não encontrada")

    cobranca = doc.to_dict()

    try:

        boleto_service = BoletoService(empresa_id)

        boleto = boleto_service.gerar_boleto(cobranca)

        ref.update({
            "gateway": "BOLETO",
            "linha_digitavel": boleto["linha_digitavel"],
            "nosso_numero": boleto["nosso_numero"],
            "boleto_pdf": boleto["pdf_url"],
            "status_gateway": "GERADO"
        })

        return boleto

    except Exception as e:
        raise HTTPException(400, str(e))


# ==============================
# DETALHES DA COBRANÇA
# ==============================
@router.get("/detalhes/{empresa_id}/{cobranca_id}")
def detalhes_cobranca(empresa_id: str, cobranca_id: str):

    ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("cobrancas")
        .document(cobranca_id)
    )

    doc = ref.get()

    if not doc.exists:
        raise HTTPException(404, "Cobrança não encontrada")

    return doc.to_dict()


# ==============================
# GERAR CARNÊ
# ==============================

@router.post("/gerar-carne/{empresa_id}/{cliente_id}")
def gerar_carne(
    empresa_id: str,
    cliente_id: str,
    parcelas: int = 12
):

    empresa_ref = db.collection("empresas").document(empresa_id)

    # ==============================
    # BUSCAR CLIENTE
    # ==============================

    cliente_doc = (
        empresa_ref
        .collection("clientes")
        .document(cliente_id)
        .get()
    )

    if not cliente_doc.exists:
        raise HTTPException(404, "Cliente não encontrado")

    cliente = cliente_doc.to_dict()

    # ==============================
    # BUSCAR CONTRATO DO CLIENTE
    # ==============================

    contratos = (
        empresa_ref
        .collection("contratos")
        .where("cliente_id", "==", cliente_id)
        .limit(1)
        .stream()
    )

    contrato = None
    contrato_id = None

    for doc in contratos:
        contrato = doc.to_dict()
        contrato_id = doc.id

    if not contrato:
        raise HTTPException(400, "Contrato não encontrado")

    valor = contrato.get("valor_mensal")

    if not valor:
        raise HTTPException(400, "Contrato sem valor mensal")

    # ==============================
    # GERAR PARCELAS
    # ==============================

    cobrancas_criadas = []

    agora = datetime.utcnow()

    # ==============================
    # CARREGAR GATEWAY DA EMPRESA
    # ==============================

    gateway = GatewayService(empresa_id)

    for i in range(parcelas):

        vencimento = agora + timedelta(days=30 * i)

        cobranca_id = str(uuid.uuid4())

        cobranca = {
            "id": cobranca_id,
            "cliente_id": cliente_id,
            "cliente_nome": cliente["nome"],
            "contrato_id": contrato_id,
            "valor": valor,
            "status": "PENDENTE",
            "tipo": "CARNE",
            "parcela": i + 1,
            "total_parcelas": parcelas,
            "criado_em": datetime.utcnow(),
            "vencimento": vencimento,

            "gateway": None,
            "gateway_id": None,
            "linha_digitavel": None,
            "pix_qrcode": None,
            "pix_copia_cola": None,
            "status_gateway": None
        }

        empresa_ref.collection("cobrancas").document(cobranca_id).set(cobranca)

        cobrancas_criadas.append(cobranca_id)

    # ==============================
    # RETORNO
    # ==============================

    return {
        "parcelas": parcelas,
        "cliente": cliente["nome"],
        "valor_parcela": valor,
        "cobrancas_criadas": cobrancas_criadas
    }


# ==============================
# FATURAS DO CLIENTE
# ==============================

@router.get("/cliente/{empresa_id}/{cliente_id}")
def faturas_cliente(empresa_id: str, cliente_id: str):

    docs = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("cobrancas")
        .where("cliente_id", "==", cliente_id)
        .stream()
    )

    faturas = []

    for doc in docs:

        data = doc.to_dict()

        faturas.append({
            "id": data.get("id"),
            "valor": data.get("valor"),
            "vencimento": data.get("vencimento").strftime("%d/%m/%Y") if data.get("vencimento") else None,
            "status": data.get("status"),
            "linha_digitavel": data.get("linha_digitavel"),
            "pix_copia_cola": data.get("pix_copia_cola")
        })

    return faturas