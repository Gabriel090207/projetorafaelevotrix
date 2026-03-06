import requests
from app.core.firebase import db


class ReceitaNetService:

    def __init__(self, empresa_id: str):

        docs = (
            db.collection("empresas")
            .document(empresa_id)
            .collection("integracoes")
            .where("tipo", "==", "receitanet")
            .where("ativo", "==", True)
            .stream()
        )

        config = None

        for doc in docs:
            config = doc.to_dict()

        if not config:
            raise Exception("Integração Receitanet não configurada")

        dados = config["config"]

        self.base_url = dados["url"].rstrip("/")
        self.client_id = dados["client_id"]
        self.client_secret = dados["client_secret"]

        self.token = None

    # ==========================
    # AUTENTICAR
    # ==========================

    def autenticar(self):

        url = f"{self.base_url}/auth"

        payload = {
            "client_id": self.client_id,
            "client_secret": self.client_secret
        }

        response = requests.post(
            url,
            json=payload,
            timeout=10
        )

        if response.status_code != 200:
            raise Exception("Erro ao autenticar Receitanet")

        data = response.json()

        self.token = data.get("access_token")

    # ==========================
    # HEADERS
    # ==========================

    def headers(self):

        if not self.token:
            self.autenticar()

        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    # ==========================
    # EMITIR NOTA
    # ==========================

    def emitir_nota(self, payload):

        url = f"{self.base_url}/nfse"

        response = requests.post(
            url,
            headers=self.headers(),
            json=payload,
            timeout=10
        )

        if response.status_code != 200:
            return {
                "ok": False,
                "erro": response.text
            }

        return response.json()

    # ==========================
    # CONSULTAR NOTA
    # ==========================

    def consultar_nota(self, nota_id):

        url = f"{self.base_url}/nfse/{nota_id}"

        response = requests.get(
            url,
            headers=self.headers(),
            timeout=10
        )

        if response.status_code != 200:
            return {
                "ok": False,
                "erro": response.text
            }

        return response.json()

    # ==========================
    # CANCELAR NOTA
    # ==========================

    def cancelar_nota(self, nota_id):

        url = f"{self.base_url}/nfse/{nota_id}"

        response = requests.delete(
            url,
            headers=self.headers(),
            timeout=10
        )

        if response.status_code != 200:
            return {
                "ok": False,
                "erro": response.text
            }

        return response.json()