from fastapi import APIRouter, Depends
from app.core.deps import require_empresa_access
from app.core.firebase import db
import uuid

router = APIRouter(prefix="/equipamentos", tags=["Equipamentos"])


# ===============================
# LISTAR EQUIPAMENTOS
# ===============================

@router.get("/")
def listar_equipamentos(ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    docs = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("equipamentos")
        .stream()
    )

    equipamentos = []

    for doc in docs:

        data = doc.to_dict()
        data["id"] = doc.id

        equipamentos.append(data)

    return equipamentos


# ===============================
# BUSCAR EQUIPAMENTO
# ===============================

@router.get("/{equipamento_id}")
def buscar_equipamento(equipamento_id: str, ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    doc = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("equipamentos")
        .document(equipamento_id)
        .get()
    )

    if not doc.exists:
        return {"erro": "Equipamento não encontrado"}

    data = doc.to_dict()
    data["id"] = doc.id

    return data


# ===============================
# CRIAR EQUIPAMENTO
# ===============================

@router.post("/")
def criar_equipamento(payload: dict, ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    equipamento_id = str(uuid.uuid4())

    payload["id"] = equipamento_id
    payload["status"] = "ativo"

    db.collection("empresas") \
        .document(empresa_id) \
        .collection("equipamentos") \
        .document(equipamento_id) \
        .set(payload)

    return payload


# ===============================
# EDITAR EQUIPAMENTO
# ===============================

@router.put("/{equipamento_id}")
def editar_equipamento(
    equipamento_id: str,
    payload: dict,
    ctx=Depends(require_empresa_access)
):

    empresa_id = ctx["empresa_id"]

    ref = db.collection("empresas") \
        .document(empresa_id) \
        .collection("equipamentos") \
        .document(equipamento_id)

    ref.update(payload)

    return {"ok": True}


# ===============================
# REMOVER EQUIPAMENTO
# ===============================

@router.delete("/{equipamento_id}")
def remover_equipamento(
    equipamento_id: str,
    ctx=Depends(require_empresa_access)
):

    empresa_id = ctx["empresa_id"]

    db.collection("empresas") \
        .document(empresa_id) \
        .collection("equipamentos") \
        .document(equipamento_id) \
        .delete()

    return {"ok": True}


from app.services.mk_auth import MKAuth
import requests


# ===============================
# STATUS DO EQUIPAMENTO
# ===============================

@router.get("/{equipamento_id}/status")
def status_equipamento(
    equipamento_id: str,
    ctx=Depends(require_empresa_access)
):

    empresa_id = ctx["empresa_id"]

    doc = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("equipamentos")
        .document(equipamento_id)
        .get()
    )

    if not doc.exists:
        return {"erro": "Equipamento não encontrado"}

    equipamento = doc.to_dict()

    ip = equipamento.get("ip")
    tipo = equipamento.get("tipo")

    resultado = {
        "ip": ip,
        "tipo": tipo,
        "ping": False,
        "cpu": None,
        "memoria": None,
        "clientes_online": None
    }

    # ===============================
    # TESTE DE PING
    # ===============================

    try:

        r = requests.get(f"http://{ip}", timeout=2)

        resultado["ping"] = True

    except:
        resultado["ping"] = False

    # ===============================
    # MIKROTIK STATUS
    # ===============================

    if tipo == "mikrotik":

        try:

            mk = MKAuth(empresa_id)

            online = mk.clientes_online()

            resultado["clientes_online"] = online

        except Exception as e:

            resultado["erro_mikrotik"] = str(e)

    return resultado