from fastapi import Header, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.firebase_auth import verify_firebase_token
from app.core.firebase import db

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Token ausente")
    try:
        decoded = verify_firebase_token(credentials.credentials)
        return decoded
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")


def require_empresa_access(
    user=Depends(get_current_user),
    x_empresa_id: str | None = Header(default=None, alias="X-Empresa-Id"),
):
    if not x_empresa_id:
        raise HTTPException(status_code=400, detail="X-Empresa-Id ausente")

    uid = user.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="Usuário inválido")

    doc = (
        db.collection("empresas")
        .document(x_empresa_id)
        .collection("usuarios")
        .document(uid)
        .get()
    )

    if not doc.exists:
        raise HTTPException(status_code=403, detail="Sem acesso a esta empresa")

    return {
        "uid": uid,
        "email": user.get("email"),
        "empresa_id": x_empresa_id,
        "empresa_usuario": doc.to_dict() or {},
        "claims": user,
    }