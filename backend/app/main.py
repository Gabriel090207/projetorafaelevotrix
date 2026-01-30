from fastapi import FastAPI
from app.routers import auth

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

@app.get("/")
def root():
    return {"status": "API Evotrix rodando"}
