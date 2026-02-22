from fastapi import APIRouter, HTTPException, Request
from datetime import datetime
from app.core.firebase import db

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/sgp/{empresa_id}")
async def webhook_sgp(empresa_id: str, request: Request):
    payload = await request.json()
    headers = dict(request.headers)

    # Buscar config SGP no Firestore
    docs = db.collection("integracoes") \
        .where("empresa_id", "==", empresa_id) \
        .where("tipo", "==", "sgp") \
        .where("ativo", "==", True) \
        .stream()

    config = None
    for doc in docs:
        config = doc.to_dict()

    if not config:
        raise HTTPException(status_code=404, detail="Integração SGP não configurada")

    dados = config.get("config", {})
    api_key = dados.get("api_key")
    api_secret = dados.get("api_secret")
    bearer = dados.get("bearer")  # opcional

    # --- Validação (1) api_key/api_secret no body ---
    body_key = payload.get("api_key") or payload.get("key")
    body_secret = payload.get("api_secret") or payload.get("secret")

    # --- Validação (2) bearer no header ---
    auth_header = headers.get("authorization") or headers.get("Authorization")

    autorizado = False

    if api_key and api_secret and body_key == api_key and body_secret == api_secret:
        autorizado = True

    if bearer and auth_header and bearer in auth_header:
        autorizado = True

    if not autorizado:
        raise HTTPException(status_code=401, detail="Webhook não autorizado")

    # Salvar evento recebido
    evento = {
        "empresa_id": empresa_id,
        "tipo": "sgp_gateway",
        "payload": payload,
        "headers": {
            # salva só alguns headers úteis
            "user-agent": headers.get("user-agent"),
            "content-type": headers.get("content-type"),
            "authorization": auth_header[:20] + "..." if auth_header else None
        },
        "recebido_em": datetime.utcnow().isoformat()
    }

    db.collection("webhook_events").add(evento)

    return {"ok": True}