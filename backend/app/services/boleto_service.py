from app.services.gateway_service import GatewayService


class BoletoService:

    def __init__(self, empresa_id: str):

        self.empresa_id = empresa_id
        self.gateway = GatewayService(empresa_id)

    # ==============================
    # GERAR BOLETO
    # ==============================

    def gerar_boleto(self, cobranca):

        tipo = self.gateway.tipo()

        # BANCO DO BRASIL
        if tipo == "banco_brasil":

            from app.services.banco_bb_boleto import BancoBBBoleto

            banco = BancoBBBoleto(self.empresa_id)

            return banco.gerar_boleto(cobranca)

        # EFI BANK
        if tipo == "efi_bank":

            from app.services.efi_boleto import EfiBoleto

            banco = EfiBoleto(self.empresa_id)

            return banco.gerar_boleto(cobranca)

        raise Exception("Gateway de boleto não suportado")