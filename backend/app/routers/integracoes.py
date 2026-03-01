from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from app.core.firebase import db
from app.services.sgp_auth import SGPAuth

router = APIRouter(prefix="/integracoes", tags=["Integrações"])


# ==============================
# MODELO
# ==============================

class IntegracaoInput(BaseModel):
    empresa_id: str
    tipo: str
    nome: str 
    config: dict
    ativo: bool = True


def now():
    return datetime.utcnow().isoformat()


# ==============================
# SALVAR / ATUALIZAR INTEGRAÇÃO
# ==============================

@router.post("/")
def salvar_integracao(dados: IntegracaoInput):

    integracoes_ref = (
        db.collection("empresas")
        .document(dados.empresa_id)
        .collection("integracoes")
    )

    # Verifica se já existe integração desse tipo
    docs = (
        integracoes_ref
        .where("tipo", "==", dados.tipo)
        .stream()
    )

    existente = None
    for doc in docs:
        existente = doc

    integracao_data = {
        "empresa_id": dados.empresa_id,  # mantemos por segurança
        "tipo": dados.tipo,
        "nome": dados.nome,
        "config": dados.config,
        "ativo": dados.ativo,
        "atualizado_em": now()
    }

    if existente:
        integracoes_ref.document(existente.id).update(integracao_data)
        return {"message": "Integração atualizada com sucesso"}
    else:
        integracao_data["criado_em"] = now()
        integracoes_ref.add(integracao_data)
        return {"message": "Integração criada com sucesso"}


# ==============================
# LISTAR INTEGRAÇÕES DA EMPRESA
# ==============================

@router.get("/{empresa_id}")
def listar_integracoes(empresa_id: str):

    docs = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("integracoes")
        .stream()
    )

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

    docs = (
        db.collection("empresas")
        .document(empresa_id)
        .collection("integracoes")
        .where("tipo", "==", tipo)
        .stream()
    )

    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        return data

    raise HTTPException(404, "Integração não encontrada")


# ==============================
# TESTAR CONEXÃO SGP
# ==============================

@router.post("/{empresa_id}/sgp/testar")
def testar_sgp(empresa_id: str):
    try:
        sgp = SGPAuth(empresa_id=empresa_id)
        return sgp.testar_conexao()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==============================
# BUSCAR CLIENTE DIRETO NO SGP
# ==============================

@router.get("/{empresa_id}/sgp/cliente/{cpfcnpj}")
def buscar_cliente_sgp(empresa_id: str, cpfcnpj: str):
    try:
        sgp = SGPAuth(empresa_id)
        return sgp.consultar_cliente_por_cpfcnpj(cpfcnpj)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))