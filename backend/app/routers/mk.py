from fastapi import APIRouter, HTTPException, Depends
from app.services.mk_auth import MKAuth
from app.core.deps import require_empresa_access

router = APIRouter(prefix="/mk", tags=["MK-AUTH"])

# ==============================
# TESTAR INTEGRAÇÃO MK-AUTH
# ==============================

@router.get("/test")
def testar_mk(ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    try:

        mk = MKAuth(empresa_id)

        mk.autenticar()

        return {
            "status": "ok",
            "mensagem": "MKAuth conectado com sucesso"
        }

    except Exception as e:

        return {
            "status": "erro",
            "erro": str(e)
        }
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