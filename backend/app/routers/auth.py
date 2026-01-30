from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(data: LoginRequest):
    print("LOGIN RECEBIDO:", data)

    if data.username == "admin" and data.password == "123456":
        return {
            "access_token": "token-fake-por-enquanto",
            "token_type": "bearer"
        }

    raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")
