from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from app.core.firebase import db

router = APIRouter(prefix="/cobrancas", tags=["Cobranças"])


@router.post("/gerar/{cliente_id}")
def gerar_cobranca(cliente_id: str):
    cliente_ref = db.collection("clientes").document(cliente_id).get()

    if not cliente_ref.exists:
        raise HTTPException(404, "Cliente não encontrado")

    cliente = cliente_ref.to_dict()

    # ===== Evitar cobrança duplicada no mês =====
    agora = datetime.utcnow()
    inicio_mes = datetime(agora.year, agora.month, 1)

    docs = db.collection("cobrancas") \
        .where("cliente_id", "==", cliente_id) \
        .stream()

    for doc in docs:
        data = doc.to_dict()
        data_criacao = datetime.fromisoformat(data["data_criacao"])

        if data_criacao >= inicio_mes:
            raise HTTPException(
                400,
                "Cobrança já existe para este cliente neste mês"
            )

    # ===== Verifica plano do cliente =====
    plano_id = cliente.get("plano_id")
    if not plano_id:
        raise HTTPException(400, "Cliente sem plano")

    plano_ref = db.collection("planos").document(plano_id).get()

    if not plano_ref.exists:
        raise HTTPException(404, "Plano não encontrado")

    plano = plano_ref.to_dict()

    # ===== Criação da cobrança =====
    vencimento = datetime.utcnow() + timedelta(days=30)

    cobranca = {
        "cliente_id": cliente_id,
        "cliente_nome": cliente["nome"],
        "valor": plano["valor"],
        "status": "pendente",
        "data_criacao": datetime.utcnow().isoformat(),
        "data_vencimento": vencimento.isoformat()
    }

    db.collection("cobrancas").add(cobranca)

    return {"message": "Cobrança gerada"}


@router.get("/")
def listar_cobrancas():
    docs = db.collection("cobrancas").stream()

    cobrancas = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        cobrancas.append(data)

    return cobrancas


@router.put("/pagar/{cobranca_id}")
def pagar_cobranca(cobranca_id: str):
    ref = db.collection("cobrancas").document(cobranca_id)

    if not ref.get().exists:
        raise HTTPException(404, "Cobrança não encontrada")

    ref.update({"status": "pago"})

    return {"message": "Cobrança marcada como paga"}


@router.post("/gerar-mensal")
def gerar_cobrancas_mensais():
    clientes_docs = db.collection("clientes").stream()

    geradas = 0
    ignoradas = 0

    agora = datetime.utcnow()
    inicio_mes = datetime(agora.year, agora.month, 1)

    for cliente_doc in clientes_docs:
        cliente_id = cliente_doc.id
        cliente = cliente_doc.to_dict()

        plano_id = cliente.get("plano_id")
        if not plano_id:
            ignoradas += 1
            continue

        docs = db.collection("cobrancas") \
            .where("cliente_id", "==", cliente_id) \
            .stream()

        ja_existe = False

        for doc in docs:
            data = doc.to_dict()
            data_criacao = datetime.fromisoformat(data["data_criacao"])

            if data_criacao >= inicio_mes:
                ja_existe = True
                break

        if ja_existe:
            ignoradas += 1
            continue

        plano_ref = db.collection("planos").document(plano_id).get()
        if not plano_ref.exists:
            ignoradas += 1
            continue

        plano = plano_ref.to_dict()

        vencimento = datetime.utcnow() + timedelta(days=30)

        cobranca = {
            "cliente_id": cliente_id,
            "cliente_nome": cliente["nome"],
            "valor": plano["valor"],
            "status": "pendente",
            "data_criacao": datetime.utcnow().isoformat(),
            "data_vencimento": vencimento.isoformat()
        }

        db.collection("cobrancas").add(cobranca)
        geradas += 1

    return {
        "cobrancas_geradas": geradas,
        "clientes_ignorados": ignoradas
    }
