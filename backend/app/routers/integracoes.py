from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from app.core.firebase import db

router = APIRouter(prefix="/integracoes", tags=["Integrações"])


# ==============================
# MODELO
# ==============================

class IntegracaoInput(BaseModel):
    empresa_id: str
    tipo: str
    config: dict
    ativo: bool = True


# ==============================
# SALVAR / ATUALIZAR INTEGRAÇÃO
# ==============================

@router.post("/")
def salvar_integracao(dados: IntegracaoInput):

    # Verifica se já existe integração desse tipo para essa empresa
    docs = db.collection("integracoes") \
        .where("empresa_id", "==", dados.empresa_id) \
        .where("tipo", "==", dados.tipo) \
        .stream()

    existente = None
    for doc in docs:
        existente = doc

    integracao_data = {
        "empresa_id": dados.empresa_id,
        "tipo": dados.tipo,
        "config": dados.config,
        "ativo": dados.ativo,
        "atualizado_em": datetime.utcnow().isoformat()
    }

    if existente:
        db.collection("integracoes").document(existente.id).update(integracao_data)
        return {"message": "Integração atualizada com sucesso"}
    else:
        integracao_data["criado_em"] = datetime.utcnow().isoformat()
        db.collection("integracoes").add(integracao_data)
        return {"message": "Integração criada com sucesso"}


# ==============================
# BUSCAR INTEGRAÇÃO POR EMPRESA
# ==============================

@router.get("/{empresa_id}")
def listar_integracoes(empresa_id: str):

    docs = db.collection("integracoes") \
        .where("empresa_id", "==", empresa_id) \
        .stream()

    lista = []

    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        lista.append(data)

    return lista


# ==============================
# BUSCAR INTEGRAÇÃO ESPECÍFICA
# ==============================

@router.get("/{empresa_id}/{tipo}")
def buscar_integracao(empresa_id: str, tipo: str):

    docs = db.collection("integracoes") \
        .where("empresa_id", "==", empresa_id) \
        .where("tipo", "==", tipo) \
        .stream()

    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        return data

    raise HTTPException(404, "Integração não encontrada")
