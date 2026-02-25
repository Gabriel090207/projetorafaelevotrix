from app.core.firebase import db
from app.integrations.sgp import SGPIntegration
# futuramente:
# from app.integrations.mk import MKIntegration


def get_integration(empresa_id: str):

    docs = db.collection("integracoes") \
        .where("empresa_id", "==", empresa_id) \
        .where("ativo", "==", True) \
        .stream()

    for doc in docs:
        data = doc.to_dict()
        tipo = data["tipo"]

        if tipo == "sgp":
            return SGPIntegration(empresa_id, data["config"])

        # if tipo == "mk":
        #     return MKIntegration(empresa_id, data["config"])

    raise Exception("Nenhuma integração ativa encontrada")