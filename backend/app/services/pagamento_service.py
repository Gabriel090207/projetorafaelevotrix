from app.core.firebase import db


class PagamentoService:

    def __init__(self, empresa_id):
        self.empresa_id = empresa_id

    def marcar_pago(self, txid):

        docs = (
            db.collection("empresas")
            .document(self.empresa_id)
            .collection("cobrancas")
            .where("txid", "==", txid)
            .stream()
        )

        for doc in docs:

            db.collection("empresas") \
                .document(self.empresa_id) \
                .collection("cobrancas") \
                .document(doc.id) \
                .update({
                    "status": "PAGO"
                })