from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta

from app.core.firebase import db
from app.services.gateway_service import GatewayService
from app.services.banco_bb_pix import BancoBBPix

scheduler = BackgroundScheduler()


# ====================================
# GERAR COBRANÇAS MENSAIS
# ====================================

def gerar_cobrancas_mensais():

    print("🔄 Gerando cobranças mensais...")

    empresas = db.collection("empresas").stream()

    for empresa in empresas:

        empresa_id = empresa.id

        contratos_docs = (
            db.collection("empresas")
            .document(empresa_id)
            .collection("contratos")
            .where("status", "==", "ATIVO")
            .stream()
        )

        for contrato_doc in contratos_docs:

            contrato = contrato_doc.to_dict()

            cobranca = {
                "cliente_id": contrato["cliente_id"],
                "cliente_nome": contrato["cliente_nome"],
                "contrato_id": contrato["id"],
                "valor": contrato["valor_mensal"],
                "status": "PENDENTE",
                "tipo": "MENSALIDADE",
                "criado_em": datetime.utcnow(),
                "vencimento": datetime.utcnow() + timedelta(days=30),
                "gateway": None,
                "txid": None,
                "pix_copia_cola": None
            }

            ref = db.collection("empresas") \
                .document(empresa_id) \
                .collection("cobrancas") \
                .add(cobranca)

            cobranca_id = ref[1].id

            try:

                gateway = GatewayService(empresa_id)

                if gateway.tipo() == "banco_brasil":

                    banco = BancoBBPix(empresa_id)

                    pix = banco.gerar_pix(
                        valor=contrato["valor_mensal"],
                        descricao=f"Mensalidade {contrato['cliente_nome']}"
                    )

                    db.collection("empresas") \
                        .document(empresa_id) \
                        .collection("cobrancas") \
                        .document(cobranca_id) \
                        .update({
                            "gateway": "BANCO_BRASIL",
                            "txid": pix.get("txid"),
                            "pix_copia_cola": pix.get("pixCopiaECola")
                        })

            except Exception as e:

                print(f"Erro gerar PIX empresa {empresa_id}: {e}")


# ====================================
# RÉGUA DE COBRANÇA
# ====================================

def regua_cobranca():

    print("📨 Executando régua de cobrança...")

    empresas = db.collection("empresas").stream()

    agora = datetime.utcnow()

    for empresa in empresas:

        empresa_id = empresa.id

        docs = (
            db.collection("empresas")
            .document(empresa_id)
            .collection("cobrancas")
            .stream()
        )

        for doc in docs:

            cobranca = doc.to_dict()

            if cobranca["status"] == "PAGO":
                continue

            vencimento = cobranca["vencimento"]

            dias = (vencimento.replace(tzinfo=None) - agora).days

            if dias == 3:
                print(f"Aviso 3 dias: {cobranca['cliente_nome']}")

            if dias == 0:
                print(f"Hoje vence: {cobranca['cliente_nome']}")

            if dias == -3:
                print(f"Atraso 3 dias: {cobranca['cliente_nome']}")


# ====================================
# BLOQUEIO AUTOMÁTICO
# ====================================

def bloqueio_automatico():

    print("⛔ Verificando bloqueios...")

    empresas = db.collection("empresas").stream()

    agora = datetime.utcnow()

    for empresa in empresas:

        empresa_id = empresa.id

        docs = (
            db.collection("empresas")
            .document(empresa_id)
            .collection("cobrancas")
            .stream()
        )

        for doc in docs:

            cobranca = doc.to_dict()

            if cobranca["status"] == "PAGO":
                continue

            vencimento = cobranca["vencimento"]

            dias_atraso = (agora - vencimento.replace(tzinfo=None)).days

            if dias_atraso >= 5:

                cliente_id = cobranca["cliente_id"]

                db.collection("empresas") \
                    .document(empresa_id) \
                    .collection("clientes") \
                    .document(cliente_id) \
                    .update({
                        "status": "BLOQUEADO"
                    })


# ====================================
# AGENDAMENTO
# ====================================

scheduler.add_job(
    gerar_cobrancas_mensais,
    "cron",
    day=1,
    hour=1
)

scheduler.add_job(
    regua_cobranca,
    "interval",
    hours=6
)

scheduler.add_job(
    bloqueio_automatico,
    "interval",
    hours=12
)


def iniciar_scheduler():
    scheduler.start()