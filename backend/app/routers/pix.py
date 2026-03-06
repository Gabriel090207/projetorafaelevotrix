from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime

from app.core.firebase import db
from app.core.deps import require_empresa_access
from app.services.gateway_service import GatewayService

router = APIRouter(prefix="/pix", tags=["PIX"])


# ==============================
# INPUT PIX
# ==============================

class PixInput(BaseModel):
    valor: float
    descricao: str


# ==============================
# GERAR PIX
# ==============================

@router.post("/gerar")
def gerar_pix(
    dados: PixInput,
    ctx=Depends(require_empresa_access)
):

    empresa_id = ctx["empresa_id"]

    try:

        gateway = GatewayService(empresa_id)

        tipo = gateway.tipo()
        config = gateway.config()

        # ==============================
        # BANCO DO BRASIL
        # ==============================

        if tipo == "banco_brasil":

            from app.services.banco_bb_pix import BancoBBPix

            banco = BancoBBPix(empresa_id)

            pix = banco.gerar_pix(
                valor=dados.valor,
                descricao=dados.descricao
            )

            # ==========================
            # SALVAR COBRANÇA
            # ==========================

            cobranca = {
                "empresa_id": empresa_id,
                "cliente_nome": dados.descricao,
                "valor": dados.valor,
                "status": "PENDENTE",
                "tipo": "PIX",
                "gateway": "banco_brasil",
                "txid": pix.get("txid"),
                "pix_copia_cola": pix.get("pixCopiaECola"),
                "criado_em": datetime.utcnow().isoformat()
            }

            db.collection("empresas") \
                .document(empresa_id) \
                .collection("cobrancas") \
                .add(cobranca)

            return {
                "pix": pix,
                "cobranca": cobranca
            }

        # ==============================
        # EFI BANK (FUTURO)
        # ==============================

        if tipo == "efi_bank":
            raise Exception("Gateway Efí Bank ainda não implementado")

        # ==============================
        # OUTROS GATEWAYS
        # ==============================

        raise Exception("Gateway não suportado")

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==============================
# TESTAR TOKEN BANCO DO BRASIL
# ==============================

@router.get("/token")
def testar_token(ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    try:

        from app.services.banco_bb_pix import BancoBBPix

        banco = BancoBBPix(empresa_id)

        banco.autenticar()

        return {
            "token": banco.token
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



# ==============================
# WEBHOOK PIX
# ==============================

@router.post("/webhook")
async def webhook_pix(payload: dict):

    try:

        pix = payload.get("pix", [])

        if not pix:
            return {"status": "ok"}

        for pagamento in pix:

            txid = pagamento.get("txid")

            if not txid:
                continue

            # ==========================
            # BUSCAR COBRANÇA
            # ==========================

            empresas = db.collection("empresas").stream()

            for empresa in empresas:

                empresa_id = empresa.id

                cobrancas_ref = (
                    db.collection("empresas")
                    .document(empresa_id)
                    .collection("cobrancas")
                    .where("txid", "==", txid)
                    .stream()
                )

                for cobranca in cobrancas_ref:

                    db.collection("empresas") \
                        .document(empresa_id) \
                        .collection("cobrancas") \
                        .document(cobranca.id) \
                        .update({
                            "status": "PAGO"
                        })

        return {"status": "ok"}

    except Exception as e:

        raise HTTPException(status_code=400, detail=str(e))