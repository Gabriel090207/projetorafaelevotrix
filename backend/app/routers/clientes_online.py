from fastapi import APIRouter, Depends
from app.core.deps import require_empresa_access
from app.services.mk_auth import MKAuth

router = APIRouter(prefix="/clientes-online", tags=["Clientes Online"])


@router.get("/")
def listar_clientes_online(ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    try:

        mk = MKAuth(empresa_id)

        online = mk.clientes_online()

        return online

    except Exception as e:

        return {
            "erro": str(e)
        }