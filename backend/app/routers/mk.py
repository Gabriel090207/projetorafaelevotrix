from fastapi import APIRouter, HTTPException, Depends
from app.services.mk_auth import MKAuth
from app.core.deps import require_empresa_access

router = APIRouter(prefix="/mk", tags=["MK-AUTH"])


# ==============================
# LISTAR CLIENTES DO MK
# ==============================

@router.get("/clientes")
def listar_clientes_mk(
    pagina: int = 1,
    ctx=Depends(require_empresa_access)
):

    empresa_id = ctx["empresa_id"]

    try:

        mk = MKAuth(empresa_id)

        resultado = mk.listar_clientes(pagina)

        return resultado

    except Exception as e:

        raise HTTPException(status_code=400, detail=str(e))