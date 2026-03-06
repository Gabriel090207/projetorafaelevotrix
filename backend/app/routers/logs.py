from fastapi import APIRouter, Depends
from app.core.deps import require_empresa_access

router = APIRouter(prefix="/logs", tags=["Logs"])


# =========================
# LISTAR LOGS
# =========================

@router.get("/empresa/{empresa_id}")
def listar_logs(empresa_id: str, ctx=Depends(require_empresa_access)):

    # futuramente virá do banco
    return [
        {
            "id": "1",
            "cliente_nome": "Cliente Teste",
            "ip_publico": "200.100.50.10",
            "porta": 34567,
            "inicio": "2025-03-20T10:00:00",
            "fim": "2025-03-20T11:00:00"
        }
    ]