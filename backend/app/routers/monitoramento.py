from fastapi import APIRouter, Depends
import psutil
from datetime import datetime
from app.core.firebase import db

from app.core.deps import require_empresa_access
from app.services.mk_auth import MKAuth

router = APIRouter(prefix="/monitoramento", tags=["Monitoramento"])


# =========================
# MONITORAMENTO SERVIDOR
# =========================

@router.get("/servidor")
def monitorar_servidor():

    cpu = psutil.cpu_percent(interval=1)

    memoria = psutil.virtual_memory()

    rede = psutil.net_io_counters()

    return {
        "cpu_percent": cpu,
        "memoria_percent": memoria.percent,
        "memoria_usada_mb": round(memoria.used / 1024 / 1024, 2),
        "memoria_total_mb": round(memoria.total / 1024 / 1024, 2),

        "download_total_mb": round(rede.bytes_recv / 1024 / 1024, 2),
        "upload_total_mb": round(rede.bytes_sent / 1024 / 1024, 2),

        "coletado_em": datetime.utcnow().isoformat()
    }


# =========================
# MONITORAMENTO MIKROTIK
# =========================

@router.get("/mikrotik")
def monitorar_mikrotik(ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    try:

        mk = MKAuth(empresa_id)

        online = mk.clientes_online()

        return {
            "clientes_online": online
        }

    except Exception as e:

        return {
            "erro": str(e)
        }


# =========================
# MONITORAMENTO GERAL
# =========================

@router.get("/empresa/{empresa_id}")
def monitoramento_empresa(empresa_id: str):

    cpu = psutil.cpu_percent(interval=1)

    memoria = psutil.virtual_memory()

    try:

        mk = MKAuth(empresa_id)

        clientes_online = mk.clientes_online()

    except Exception:

        clientes_online = 0


    return [

        {
            "nome": "Servidor Principal",
            "ip": "127.0.0.1",
            "cpu": cpu,
            "memoria": memoria.percent,
            "uptime": "online",
            "trafego": 0
        },

        {
            "nome": "MikroTik",
            "ip": "router",
            "cpu": 0,
            "memoria": 0,
            "uptime": f"{clientes_online} clientes online",
            "trafego": clientes_online
        }

    ]


# ===============================
# DASHBOARD NOC
# ===============================

@router.get("/noc")
def dashboard_noc(ctx=Depends(require_empresa_access)):

    empresa_id = ctx["empresa_id"]

    equipamentos_ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("equipamentos")
        .stream()
    )

    total_equipamentos = 0
    mikrotiks = 0
    olts = 0
    onus = 0

    for doc in equipamentos_ref:

        total_equipamentos += 1
        eq = doc.to_dict()

        tipo = eq.get("tipo")

        if tipo == "mikrotik":
            mikrotiks += 1

        if tipo == "olt":
            olts += 1

        if tipo == "onu":
            onus += 1

    clientes_ref = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("clientes")
        .stream()
    )

    total_clientes = 0

    for _ in clientes_ref:
        total_clientes += 1

    return {
        "equipamentos": total_equipamentos,
        "mikrotiks": mikrotiks,
        "olts": olts,
        "onus": onus,
        "clientes": total_clientes
    }
