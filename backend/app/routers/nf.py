from fastapi import APIRouter, Depends
from app.core.deps import require_empresa_access
from app.services.receitanet_service import ReceitaNetService

router = APIRouter(prefix="/nf", tags=["Notas Fiscais"])


# ==============================
# EMITIR NOTA
# ==============================

@router.post("/emissao")
def emitir_nota(payload: dict, ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    try:

        receitanet = ReceitaNetService(empresa_id)

        nota = receitanet.emitir_nota(payload)

        return nota

    except Exception as e:

        return {
            "erro": str(e)
        }


# ==============================
# CONSULTAR NOTA
# ==============================

@router.get("/{nota_id}")
def consultar_nota(nota_id: str, ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    try:

        receitanet = ReceitaNetService(empresa_id)

        nota = receitanet.consultar_nota(nota_id)

        return nota

    except Exception as e:

        return {
            "erro": str(e)
        }


# ==============================
# CANCELAR NOTA
# ==============================

@router.delete("/{nota_id}")
def cancelar_nota(nota_id: str, ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    try:

        receitanet = ReceitaNetService(empresa_id)

        cancel = receitanet.cancelar_nota(nota_id)

        return cancel

    except Exception as e:

        return {
            "erro": str(e)
        }