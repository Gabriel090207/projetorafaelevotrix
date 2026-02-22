from fastapi import FastAPI
from app.core.firebase import db


from app.routers import auth
from app.routers import clientes
from app.routers import planos
from app.routers import cobrancas
from app.routers import monitoramento
from app.routers import bot


from app.routers import mk
from app.routers import integracoes
from app.routers import webhooks
from app.routers import sync
from app.routers import receitanet

app = FastAPI(title="Projeto Evotrix API")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(clientes.router)
app.include_router(planos.router)
app.include_router(cobrancas.router)
app.include_router(monitoramento.router)
app.include_router(bot.router)


app.include_router(mk.router)
app.include_router(integracoes.router)
app.include_router(webhooks.router)
app.include_router(sync.router)
app.include_router(receitanet.router)


@app.get("/")
def root():
    return {"status": "API Evotrix rodando"}

@app.get("/firebase-test")
def firebase_test():
    db.collection("teste").add({"status": "conectado"})
    return {"firebase": "ok"}
