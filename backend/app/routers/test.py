from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from app.core.firebase_auth import verify_firebase_token

router = APIRouter(prefix="/teste", tags=["Teste"])

security = HTTPBearer()


def get_current_user(credentials=Depends(security)):
    try:
        decoded = verify_firebase_token(credentials.credentials)
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")


@router.get("/protegido")
def rota_protegida(user=Depends(get_current_user)):
    return {
        "message": "Token válido!",
        "uid": user["uid"],
        "email": user.get("email")
    }