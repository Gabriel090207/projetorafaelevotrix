from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.firebase import db

# =====================================================
# 🚀 CRIAÇÃO DA APLICAÇÃO
# =====================================================

app = FastAPI(title="Projeto Evotrix API")

# =====================================================
# 🔐 CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# 📦 IMPORTAÇÃO DOS ROUTERS
# =====================================================

# 🔓 Público
from app.routers import auth
from app.routers import test

# 🏢 Operação
from app.routers import clientes
from app.routers import contratos
from app.routers import bot
from app.routers import ordens_servico

# 💰 Financeiro
from app.routers import cobrancas
from app.routers import receitanet
from app.routers import nf
from app.routers import nfcom

# 🌐 Rede
from app.routers import monitoramento
from app.routers import mk
from app.routers import integracoes
from app.routers import olts
from app.routers import pons
from app.routers import onus
from app.routers import ctos
from app.routers import mapa_ftth
from app.routers import logs
from app.routers import clientes_online
from app.routers import equipamentos

# 📦 Produtos
from app.routers import planos

# ⚙ Administração
from app.routers import empresas
from app.routers import usuarios
from app.routers import webhooks
from app.routers import sync


# =====================================================
# 🔗 REGISTRO DOS ROUTERS
# =====================================================

# 🔓 Público
app.include_router(auth.router)
app.include_router(test.router)

# 🏢 Operação
app.include_router(clientes.router)
app.include_router(contratos.router)
app.include_router(bot.router)
app.include_router(ordens_servico.router)

# 💰 Financeiro
app.include_router(cobrancas.router)
app.include_router(receitanet.router)
app.include_router(nf.router)
app.include_router(nfcom.router)


# 🌐 Rede
app.include_router(monitoramento.router)
app.include_router(mk.router)
app.include_router(integracoes.router)
app.include_router(olts.router)
app.include_router(pons.router)
app.include_router(onus.router)
app.include_router(ctos.router)
app.include_router(mapa_ftth.router)
app.include_router(logs.router)
app.include_router(clientes_online.router)
app.include_router(equipamentos.router)



# 📦 Produtos
app.include_router(planos.router)

# ⚙ Administração
app.include_router(empresas.router)
app.include_router(usuarios.router)
app.include_router(webhooks.router)
app.include_router(sync.router)


# =====================================================
# 🧪 ROTAS BASE
# =====================================================

@app.get("/")
def root():
    return {"status": "API Evotrix rodando"}

@app.get("/firebase-test")
def firebase_test():
    db.collection("teste").add({"status": "conectado"})
    return {"firebase": "ok"}