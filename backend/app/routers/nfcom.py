from fastapi import APIRouter, Depends
from app.core.deps import require_empresa_access
from app.services.nfcom_service import NFCOMService

router = APIRouter(prefix="/nfcom", tags=["NFCOM"])


# ==========================
# EMITIR NFCOM
# ==========================

@router.post("/emissao")
def emitir_nfcom(payload: dict, ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    try:

        nfcom = NFCOMService(empresa_id)

        nota = nfcom.emitir_nfcom(payload)

        return nota

    except Exception as e:

        return {"erro": str(e)}


# ==========================
# CONSULTAR NFCOM
# ==========================

@router.get("/{nota_id}")
def consultar_nfcom(nota_id: str, ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    try:

        nfcom = NFCOMService(empresa_id)

        nota = nfcom.consultar_nfcom(nota_id)

        return nota

    except Exception as e:

        return {"erro": str(e)}


# ==========================
# CANCELAR NFCOM
# ==========================

@router.delete("/{nota_id}")
def cancelar_nfcom(nota_id: str, ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    try:

        nfcom = NFCOMService(empresa_id)

        cancel = nfcom.cancelar_nfcom(nota_id)

        return cancel

    except Exception as e:

        return {"erro": str(e)}