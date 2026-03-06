from app.services.receitanet_service import ReceitaNetService


class NFCOMService:

    def __init__(self, empresa_id: str):

        self.receitanet = ReceitaNetService(empresa_id)

    # ==========================
    # EMITIR NFCOM
    # ==========================

    def emitir_nfcom(self, payload):

        payload_nfcom = {
            "modelo": "62",
            "tipo_servico": "internet",
            "dados": payload
        }

        return self.receitanet.emitir_nota(payload_nfcom)

    # ==========================
    # CONSULTAR NFCOM
    # ==========================

    def consultar_nfcom(self, nota_id):

        return self.receitanet.consultar_nota(nota_id)

    # ==========================
    # CANCELAR NFCOM
    # ==========================

    def cancelar_nfcom(self, nota_id):

        return self.receitanet.cancelar_nota(nota_id)