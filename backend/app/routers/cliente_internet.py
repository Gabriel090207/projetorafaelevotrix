from fastapi import APIRouter, Depends, HTTPException
from app.services.mk_auth import MKAuth
from app.core.deps import require_empresa_access
from app.core.firebase import db
from datetime import datetime

router = APIRouter(prefix="/cliente", tags=["Cliente Internet"])


@router.get("/internet")
def status_internet(ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]
    cliente_id = ctx["user_id"]

    try:

        cliente_doc = (
            db.collection("empresas")
            .document(empresa_id)
            .collection("clientes")
            .document(cliente_id)
            .get()
        )

        if not cliente_doc.exists:
            raise HTTPException(404, "Cliente não encontrado")

        cliente = cliente_doc.to_dict()

        login = cliente.get("login")

        if not login:
            raise HTTPException(400, "Cliente sem login PPPoE")

        mk = MKAuth(empresa_id)

        online = mk.clientes_online()

        cliente_online = None

        for c in online:
            if c["usuario"] == login:
                cliente_online = c
                break

        if not cliente_online:

            return {
                "status": "offline",
                "ip": "-",
                "ultima_conexao": "-",
                "reconexoes": 0,
                "download": "0 MB",
                "upload": "0 MB"
            }

        return {
            "status": "online",
            "ip": cliente_online["ip"],
            "ultima_conexao": cliente_online["uptime"],
            "reconexoes": 0,
            "download": cliente_online["download"],
            "upload": cliente_online["upload"],
            "nas": "Mikrotik",
            "service": "PPPoE"
        }

    except Exception as e:
        raise HTTPException(400, str(e))