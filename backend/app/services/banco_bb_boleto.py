import requests
from app.core.firebase import db


class BancoBBBoleto:

    def __init__(self, empresa_id):

        self.empresa_id = empresa_id

        docs = (
            db.collection("empresas")
            .document(empresa_id)
            .collection("gateways")
            .where("tipo", "==", "banco_brasil")
            .where("ativo", "==", True)
            .stream()
        )

        config = None

        for doc in docs:
            config = doc.to_dict()

        if not config:
            raise Exception("Gateway Banco do Brasil não configurado")

        dados = config["config"]

        self.client_id = dados["client_id"]
        self.client_secret = dados["client_secret"]
        self.base_url = "https://api.bb.com.br/cobrancas/v2"

    # ==============================
    # GERAR BOLETO
    # ==============================

    def gerar_boleto(self, cobranca):

        payload = {
            "numeroConvenio": "1234567",
            "numeroCarteira": "17",
            "numeroVariacaoCarteira": "019",
            "codigoModalidade": 1,
            "dataEmissao": cobranca["criado_em"],
            "dataVencimento": cobranca["vencimento"],
            "valorOriginal": cobranca["valor"],
            "pagador": {
                "nome": cobranca["cliente_nome"]
            }
        }

        # Simulação inicial
        return {
            "linha_digitavel": "00190.00009 01234.567890 12345.678901 1 12340000010000",
            "nosso_numero": "123456789",
            "pdf_url": "https://boleto-exemplo.pdf"
        }