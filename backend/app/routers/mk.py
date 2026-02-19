from fastapi import APIRouter
from app.integrations.mk_auth import MKAuth

router = APIRouter(prefix="/mk", tags=["MK-Auth"])

@router.get("/clientes")
def listar_clientes():
    mk = MKAuth()
    return mk.listar_clientes()
