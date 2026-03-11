from fastapi import Header, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.firebase_auth import verify_firebase_token
from app.core.firebase import db

security = HTTPBearer(auto_error=False)


# =========================
# USUÁRIO ATUAL
# =========================
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


# =========================
# ACESSO À EMPRESA
# =========================
def require_empresa_access(
    user=Depends(get_current_user),
    x_empresa_id: str | None = Header(default=None, alias="X-Empresa-Id"),
):

    if not x_empresa_id:
        raise HTTPException(status_code=400, detail="X-Empresa-Id ausente")

    uid = user.get("uid")

    if not uid:
        raise HTTPException(status_code=401, detail="Usuário inválido")

    # =========================
    # VERIFICAR USUÁRIO DA EMPRESA
    # =========================
    usuario_doc = (
        db.collection("empresas")
        .document(x_empresa_id)
        .collection("usuarios")
        .document(uid)
        .get()
    )

    if usuario_doc.exists:
        return {
            "uid": uid,
            "email": user.get("email"),
            "empresa_id": x_empresa_id,
            "empresa_usuario": usuario_doc.to_dict() or {},
            "user_id": uid,
            "tipo": "usuario",
            "claims": user,
        }

    # =========================
    # VERIFICAR SE É CLIENTE
    # =========================
    cliente_query = (
        db.collection("empresas")
        .document(x_empresa_id)
        .collection("clientes")
        .where("email", "==", user.get("email"))
        .limit(1)
        .stream()
    )

    cliente = None
    for c in cliente_query:
        cliente = c

    if cliente:
        return {
            "uid": uid,
            "email": user.get("email"),
            "empresa_id": x_empresa_id,
            "empresa_usuario": {},
            "user_id": cliente.id,
            "tipo": "cliente",
            "claims": user,
        }

    raise HTTPException(status_code=403, detail="Sem acesso a esta empresa")