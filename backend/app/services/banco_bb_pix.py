import requests
from app.core.firebase import db


class BancoBBPix:

    def __init__(self, empresa_id: str):

        docs = (
            db.collection("empresas")
            .document(empresa_id)
            .collection("integracoes")
            .where("tipo", "==", "banco_bb")
            .where("ativo", "==", True)
            .stream()
        )

        config = None

        for doc in docs:
            config = doc.to_dict()

        if not config:
            raise Exception("Banco do Brasil não configurado")

        dados = config["config"]

        self.client_id = dados["client_id"]
        self.client_secret = dados["client_secret"]
        self.developer_id = dados["developer_id"]
        self.pix_chave = dados["pix_chave"]
        self.cert = f"certificados/{empresa_id}/bb_cert.pem"
        self.key = f"certificados/{empresa_id}/bb_key.pem"  

        # ambiente homologação BB
        self.base_url = "https://api.hm.bb.com.br"

        self.token = None

    # =====================================
    # AUTENTICAR NO BANCO DO BRASIL
    # =====================================

    def autenticar(self):

        url = f"{self.base_url}/oauth/token"

        payload = {
            "grant_type": "client_credentials"
        }

        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }

        response = requests.post(
            url,
            data=payload,
            headers=headers,
            auth=(self.client_id, self.client_secret),
            cert=(self.cert, self.key)
        )

        if response.status_code != 200:
            raise Exception(response.text)

        data = response.json()

        self.token = data["access_token"]

    # =====================================
    # HEADERS AUTENTICADOS
    # =====================================

    def headers(self):

        if not self.token:
            self.autenticar()

        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    # =====================================
    # GERAR COBRANÇA PIX
    # =====================================

    def gerar_pix(self, valor: float, descricao: str):

        url = f"{self.base_url}/pix/v2/cob?gw-dev-app-key={self.developer_id}"

        payload = {
            "calendario": {
                "expiracao": 3600
            },
            "devedor": {
                "nome": descricao
            },
            "valor": {
                "original": f"{valor:.2f}"
            },
            "chave": self.pix_chave,
            "solicitacaoPagador": descricao
        }

        response = requests.post(
            url,
            json=payload,
            headers=self.headers(),
            cert=(self.cert, self.key)
        )

        if response.status_code not in [200, 201]:
            raise Exception(response.text)

        return response.json()

    # =====================================
    # CONSULTAR COBRANÇA PIX
    # =====================================

    def consultar_pix(self, txid: str):

        url = f"{self.base_url}/pix/v2/cob/{txid}?gw-dev-app-key={self.developer_id}"

        response = requests.get(
            url,
            headers=self.headers(),
            cert=(self.cert, self.key)
        )

        if response.status_code != 200:
            raise Exception(response.text)

        return response.json()