from fastapi import APIRouter, HTTPException
from app.core.firebase import db

router = APIRouter(prefix="/pagamento", tags=["Pagamento"])


@router.get("/{cobranca_id}")
def ver_pagamento(cobranca_id: str):

    docs = db.collection_group("cobrancas").where("id", "==", cobranca_id).stream()

    for doc in docs:
        return doc.to_dict()

    raise HTTPException(404, "Cobrança não encontrada")