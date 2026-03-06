import requests
from app.core.firebase import db


class BancoBB:

    def __init__(self, empresa_id):

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

        self.config = config["config"]

        self.client_id = self.config["client_id"]
        self.client_secret = self.config["client_secret"]
        self.developer_id = self.config["developer_id"]

    def gerar_pix(self, valor, descricao):

        url = "https://api.bb.com.br/pix/cob"

        payload = {
            "valor": valor,
            "descricao": descricao
        }

        response = requests.post(url, json=payload)

        return response.json()