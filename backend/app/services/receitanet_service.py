import requests
from app.core.firebase import db


class ReceitaNetService:
    def __init__(self, empresa_id: str):
        docs = (
            db.collection("integracoes")
            .where("empresa_id", "==", empresa_id)
            .where("tipo", "==", "receitanet")
            .where("ativo", "==", True)
            .stream()
        )

        config = None
        for doc in docs:
            config = doc.to_dict()

        if not config:
            raise Exception("Integração ReceitaNet não configurada")

        dados = config["config"]

        self.base_url = dados["base_url"].rstrip("/")
        self.token = dados["token"]

    # ==============================
    # ENVIAR MENSAGEM
    # ==============================
    def enviar_mensagem(self, numero: str, mensagem: str):
        url = f"{self.base_url}/send-message"

        payload = {
            "token": self.token,
            "numero": numero,
            "mensagem": mensagem
        }

        r = requests.post(url, json=payload, timeout=30)

        if r.status_code != 200:
            return {"ok": False, "erro": r.text}

        return {"ok": True, "dados": r.json()}