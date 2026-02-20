import requests
from requests.auth import HTTPBasicAuth
from app.core.firebase import db


class SGPAuth:

    def __init__(self, empresa_id: str):

        docs = db.collection("integracoes") \
            .where("empresa_id", "==", empresa_id) \
            .where("tipo", "==", "sgp") \
            .where("ativo", "==", True) \
            .stream()

        config = None
        for doc in docs:
            config = doc.to_dict()

        if not config:
            raise Exception("Integração SGP não configurada para esta empresa")

        dados = config["config"]

        self.base_url = dados["base_url"].rstrip("/")
        self.client_id = dados["client_id"]
        self.client_secret = dados["client_secret"]

        self.auth = HTTPBasicAuth(self.client_id, self.client_secret)

    def listar_clientes(self):

        url = f"{self.base_url}/api/clientes"

        response = requests.get(
            url,
            auth=self.auth,
            verify=False
        )

        if response.status_code != 200:
            return {"erro": response.text}

        return response.json()