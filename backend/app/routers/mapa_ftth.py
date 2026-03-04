from fastapi import APIRouter, Depends
from app.core.firebase import db
from app.core.deps import require_empresa_access

router = APIRouter(prefix="/mapa-ftth", tags=["Mapa FTTH"])


@router.get("")
def obter_mapa_ftth(ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    empresa_ref = db.collection("empresas").document(empresa_id)

    # =========================
    # OLTs
    # =========================
    olts_docs = empresa_ref.collection("olts").stream()

    olts = []
    for doc in olts_docs:
        d = doc.to_dict()
        d["id"] = doc.id
        olts.append(d)

    # =========================
    # PONs
    # =========================
    pons_docs = empresa_ref.collection("pons").stream()

    pons = []
    for doc in pons_docs:
        d = doc.to_dict()
        d["id"] = doc.id
        pons.append(d)

    # =========================
    # CTOs
    # =========================
    ctos_docs = empresa_ref.collection("ctos").stream()

    ctos = []
    for doc in ctos_docs:
        d = doc.to_dict()
        d["id"] = doc.id
        ctos.append(d)

    # =========================
    # Clientes
    # =========================
    clientes_docs = empresa_ref.collection("clientes").stream()

    clientes = []
    for doc in clientes_docs:
        d = doc.to_dict()
        d["id"] = doc.id
        clientes.append(d)

    return {
        "olts": olts,
        "pons": pons,
        "ctos": ctos,
        "clientes": clientes
    }