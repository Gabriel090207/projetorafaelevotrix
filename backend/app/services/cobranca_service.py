from app.core.firebase import db
from datetime import datetime


class CobrancaService:

    def __init__(self, empresa_id: str):
        self.empresa_id = empresa_id

    # ==============================
    # CRIAR COBRANÇA
    # ==============================

    def criar(self, dados):

        dados["criado_em"] = datetime.utcnow().isoformat()

        ref = db.collection("empresas") \
            .document(self.empresa_id) \
            .collection("cobrancas") \
            .add(dados)

        return ref

    # ==============================
    # LISTAR COBRANÇAS
    # ==============================

    def listar(self):

        docs = db.collection("empresas") \
            .document(self.empresa_id) \
            .collection("cobrancas") \
            .stream()

        lista = []

        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            lista.append(data)

        return lista

    # ==============================
    # BUSCAR POR TXID
    # ==============================

    def buscar_por_txid(self, txid):

        docs = (
            db.collection("empresas")
            .document(self.empresa_id)
            .collection("cobrancas")
            .where("txid", "==", txid)
            .stream()
        )

        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            return data

        return None