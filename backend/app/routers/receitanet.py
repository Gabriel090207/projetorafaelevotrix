from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.receitanet_service import ReceitaNetService

router = APIRouter(prefix="/receitanet", tags=["ReceitaNet"])


class EnviarMensagemInput(BaseModel):
    empresa_id: str
    numero: str
    mensagem: str


@router.post("/enviar")
def enviar_mensagem(body: EnviarMensagemInput):
    try:
        service = ReceitaNetService(body.empresa_id)

        res = service.enviar_mensagem(
            numero=body.numero,
            mensagem=body.mensagem
        )

        if not res["ok"]:
            raise HTTPException(400, res["erro"])

        return {"ok": True}

    except Exception as e:
        raise HTTPException(400, str(e))