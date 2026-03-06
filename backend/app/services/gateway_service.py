from app.core.firebase import db


class GatewayService:

    def __init__(self, empresa_id: str):

        docs = (
            db.collection("empresas")
            .document(empresa_id)
            .collection("gateways")
            .where("ativo", "==", True)
            .stream()
        )

        self.gateway = None

        for doc in docs:
            self.gateway = doc.to_dict()

        if not self.gateway:
            raise Exception("Nenhum gateway ativo configurado")

    def tipo(self):
        return self.gateway["tipo"]

    def config(self):
        return self.gateway["config"]