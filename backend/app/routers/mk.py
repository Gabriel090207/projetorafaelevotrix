from fastapi import APIRouter, HTTPException
from app.services.mk_auth import MKAuth

router = APIRouter(prefix="/mk", tags=["MK-AUTH"])


# ==============================
# LISTAR CLIENTES DO MK
# ==============================

@router.get("/{empresa_id}/clientes")
def listar_clientes_mk(empresa_id: str):

    try:
        mk = MKAuth(empresa_id)
        resultado = mk.listar_clientes()
        return resultado

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
