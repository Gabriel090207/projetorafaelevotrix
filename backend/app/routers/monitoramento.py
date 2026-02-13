from fastapi import APIRouter
import psutil
from datetime import datetime

router = APIRouter(prefix="/monitoramento", tags=["Monitoramento"])


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
