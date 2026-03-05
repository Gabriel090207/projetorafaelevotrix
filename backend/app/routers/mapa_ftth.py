from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime

from app.core.firebase import db
from app.core.deps import require_empresa_access

router = APIRouter(prefix="/mapa-ftth", tags=["Mapa FTTH"])


# =========================
# MODEL PROJETO
# =========================

class ProjetoFTTHInput(BaseModel):
    nome: str
    descricao: str | None = None


# =========================
# CRIAR PROJETO
# =========================

@router.post("/projetos")
def criar_projeto_ftth(
    dados: ProjetoFTTHInput,
    ctx=Depends(require_empresa_access)
):

    empresa_id = ctx["empresa_id"]

    projeto_ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("projetos_ftth")
        .document()
    )

    projeto_ref.set({
        "nome": dados.nome,
        "descricao": dados.descricao,
        "criado_em": datetime.utcnow()
    })

    return {
        "ok": True,
        "id": projeto_ref.id
    }


# =========================
# MAPA FTTH
# =========================

@router.get("")
def obter_mapa_ftth(ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    empresa_ref = db.collection("empresas").document(empresa_id)

    # =========================
    # PROJETOS FTTH
    # =========================
    projetos_docs = empresa_ref.collection("projetos_ftth").stream()

    projetos = []
    for doc in projetos_docs:
        d = doc.to_dict()
        d["id"] = doc.id
        projetos.append(d)

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
    # CLIENTES
    # =========================
    clientes_docs = empresa_ref.collection("clientes").stream()

    clientes = []
    for doc in clientes_docs:
        d = doc.to_dict()
        d["id"] = doc.id
        clientes.append(d)

    return {
        "projetos": projetos,
        "olts": olts,
        "pons": pons,
        "ctos": ctos,
        "clientes": clientes
    }