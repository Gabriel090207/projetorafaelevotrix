from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.core.deps import require_empresa_access
from app.core.firebase import db

router = APIRouter(prefix="/ctos", tags=["CTOs"])


# =========================
# MODELS
# =========================

class CriarCtoInput(BaseModel):
    nome: str
    portas: int
    latitude: float | None = None
    longitude: float | None = None
    projeto_id: str | None = None
    pon_id: str | None = None


class ConectarClienteInput(BaseModel):
    cliente_id: str
    porta: int


# =========================
# REFS
# =========================

def ctos_ref(empresa_id: str):
    return (
        db.collection("empresas")
        .document(empresa_id)
        .collection("ctos")
    )


def clientes_ref(empresa_id: str):
    return (
        db.collection("empresas")
        .document(empresa_id)
        .collection("clientes")
    )


# =========================
# LISTAR CTOS
# =========================

@router.get("")
def listar_ctos(ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    docs = ctos_ref(empresa_id).stream()

    ctos = []

    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        ctos.append(d)

    return ctos


# =========================
# CRIAR CTO
# =========================

@router.post("")
def criar_cto(
    dados: CriarCtoInput,
    ctx=Depends(require_empresa_access)
):

    empresa_id = ctx["empresa_id"]

    ref = ctos_ref(empresa_id).document()

    ref.set({
        "nome": dados.nome,
        "portas": dados.portas,
        "latitude": dados.latitude,
        "longitude": dados.longitude,
        "projeto_id": dados.projeto_id
        "pon_id": dados.pon_id
    })

    return {
        "ok": True,
        "id": ref.id
    }


# =========================
# CONECTAR CLIENTE
# =========================

@router.post("/{cto_id}/conectar-cliente")
def conectar_cliente(
    cto_id: str,
    dados: ConectarClienteInput,
    ctx=Depends(require_empresa_access)
):
    empresa_id = ctx["empresa_id"]

    cto_ref = ctos_ref(empresa_id).document(cto_id)
    cto_doc = cto_ref.get()

    if not cto_doc.exists:
        raise HTTPException(status_code=404, detail="CTO não encontrada")

    cto = cto_doc.to_dict()

    portas = cto.get("portas", 0)

    if dados.porta > portas:
        raise HTTPException(status_code=400, detail="Porta inválida")

    clientes = clientes_ref(empresa_id)\
        .where("cto_id", "==", cto_id)\
        .where("porta_cto", "==", dados.porta)\
        .stream()

    for c in clientes:
        raise HTTPException(status_code=400, detail="Porta já ocupada")

    cliente_ref = clientes_ref(empresa_id).document(dados.cliente_id)
    cliente_doc = cliente_ref.get()

    if not cliente_doc.exists:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    cliente_ref.update({
        "cto_id": cto_id,
        "porta_cto": dados.porta
    })

    return {
        "ok": True,
        "message": "Cliente conectado na CTO",
        "cto_id": cto_id,
        "porta": dados.porta
    }


# =========================
# LISTAR PORTAS
# =========================

@router.get("/{cto_id}/portas")
def listar_portas_cto(
    cto_id: str,
    ctx=Depends(require_empresa_access)
):

    empresa_id = ctx["empresa_id"]

    cto_ref = ctos_ref(empresa_id).document(cto_id)
    cto_doc = cto_ref.get()

    if not cto_doc.exists:
        raise HTTPException(status_code=404, detail="CTO não encontrada")

    cto = cto_doc.to_dict()

    total_portas = cto.get("portas", 0)

    clientes = clientes_ref(empresa_id)\
        .where("cto_id", "==", cto_id)\
        .stream()

    portas_ocupadas = {}

    for cliente in clientes:
        c = cliente.to_dict()

        porta = c.get("porta_cto")

        if porta:
            portas_ocupadas[porta] = {
                "cliente_id": cliente.id,
                "nome": c.get("nome"),
                "documento": c.get("documento")
            }

    resultado = []

    for porta in range(1, total_portas + 1):

        cliente = portas_ocupadas.get(porta)

        resultado.append({
            "porta": porta,
            "ocupada": cliente is not None,
            "cliente": cliente
        })

    return resultado


# =========================
# DESCONECTAR CLIENTE
# =========================

@router.post("/{cto_id}/desconectar-cliente")
def desconectar_cliente(
    cto_id: str,
    cliente_id: str,
    ctx=Depends(require_empresa_access)
):

    empresa_id = ctx["empresa_id"]

    cliente_ref = clientes_ref(empresa_id).document(cliente_id)
    cliente_doc = cliente_ref.get()

    if not cliente_doc.exists:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")

    cliente = cliente_doc.to_dict()

    if cliente.get("cto_id") != cto_id:
        raise HTTPException(status_code=400, detail="Cliente não pertence a essa CTO")

    cliente_ref.update({
        "cto_id": None,
        "porta_cto": None
    })

    return {
        "ok": True,
        "message": "Cliente desconectado da CTO",
        "cliente_id": cliente_id
    }