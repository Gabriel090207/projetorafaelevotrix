# app/routers/clientes.py

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import random

from app.core.firebase import db
from app.services.sgp_auth import SGPAuth

router = APIRouter(prefix="/clientes", tags=["Clientes"])


# =========================
# Models
# =========================
class Cliente(BaseModel):
    nome: str
    documento: str
    telefone: str
    email: str
    endereco: str
    plano_id: Optional[str] = None

    # rede
    pppoe_user: Optional[str] = None
    pppoe_password: Optional[str] = None
    ip_address: Optional[str] = None
    conexao_status: Optional[str] = "offline"


class SyncClientesSgpInput(BaseModel):
    cpfs: List[str]


# =========================
# Helpers
# =========================
def only_digits(s: str) -> str:
    return "".join([c for c in (s or "") if c.isdigit()])


def map_conexao_status(sgp_cliente: dict) -> str:
    """
    Online se encontrar termos positivos no status do cliente OU do contrato.
    Fontes:
    - sgp_cliente["status"] / ["situacao"]
    - sgp_cliente["contratos"][0]["status"] / ["situacao"]
    """
    partes = []

    # status do cliente (raiz)
    partes.append(str(sgp_cliente.get("status") or ""))
    partes.append(str(sgp_cliente.get("situacao") or ""))

    # status do contrato (primeiro contrato)
    contratos = sgp_cliente.get("contratos") or []
    if isinstance(contratos, list) and contratos:
        c0 = contratos[0] or {}
        if isinstance(c0, dict):
            partes.append(str(c0.get("status") or ""))
            partes.append(str(c0.get("situacao") or ""))

    status_txt = " ".join([p for p in partes if p]).upper()

    termos_online = ["REGULAR", "LIBERADO", "ATIVO", "HABILITADO", "NORMAL", "EM DIA"]
    for termo in termos_online:
        if termo in status_txt:
            return "online"

    return "offline"


def _now():
    return datetime.utcnow().isoformat()

def clientes_ref(empresa_id: str):
    return (
        db.collection("empresas")
        .document(empresa_id)
        .collection("clientes")
    )


def cobrancas_ref(empresa_id: str):
    return (
        db.collection("empresas")
        .document(empresa_id)
        .collection("cobrancas")
    )


def sync_jobs_ref(empresa_id: str):
    return (
        db.collection("empresas")
        .document(empresa_id)
        .collection("sync_jobs")
    )


def _update_job(job_ref, **kwargs):
    kwargs["updated_at"] = _now()
    job_ref.update(kwargs)




def run_sync_clientes_sgp_all_job(job_id: str, empresa_id: str, limit: int = 100):
    job_ref = sync_jobs_ref(empresa_id).document(job_id)

    try:
        _update_job(job_ref, status="running", progress=0, message="Iniciando sincronização (todos)...")

        sgp = SGPAuth(empresa_id)

        inseridos = 0
        atualizados = 0
        total_titulos = 0
        erros = []
        total_lidos = 0
        offset = 0

        while True:
            res = sgp.listar_clientes(limit=limit, offset=offset)


            print("=================================")
            print("OFFSET:", offset)
            print("OK:", res.get("ok"))
            print("CLIENTES RECEBIDOS:", len((res.get("dados") or {}).get("clientes") or []))
            print("=================================")
            
            if not res.get("ok"):
                _update_job(job_ref, status="error", message=str(res.get("erro") or "Falha ao listar clientes"))
                return

            dados = res.get("dados") or {}
            clientes = dados.get("clientes") or []
            if not clientes:
                break

            for c in clientes:
                try:
                    documento = only_digits(c.get("cpfcnpj") or "")
                    if not documento:
                        continue

                    contatos = c.get("contatos") or {}

                    emails = contatos.get("emails") if isinstance(contatos, dict) else []
                    email = (c.get("email") or (emails[0] if isinstance(emails, list) and emails else "") or "").strip()

                    celulares = contatos.get("celulares") if isinstance(contatos, dict) else []
                    telefone = (
                        c.get("telefone")
                        or c.get("celular")
                        or (celulares[0] if isinstance(celulares, list) and celulares else "")
                        or ""
                    )
                    telefone = str(telefone).strip()

                    end = c.get("endereco", {}) or {}
                    endereco_txt = (
                        f'{end.get("logradouro","")}, {end.get("numero","")}, {end.get("bairro","")}, '
                        f'{end.get("cidade","")}-{end.get("uf","")}, CEP {end.get("cep","")}'
                    )

                    payload = {
                        "nome": c.get("nome", ""),
                        "documento": documento,
                        "telefone": telefone,
                        "email": email,
                        "endereco": endereco_txt.strip().strip(","),
                        "conexao_status": map_conexao_status(c),

                        "origem": "sgp",
                        "empresa_id": empresa_id,
                        "sgp_cliente_id": c.get("id"),
                        "sgp_status_raw": c.get("status") or c.get("situacao"),
                        "sgp_raw": c,
                        "sincronizado_em": _now(),
                    }

                    ref = clientes_ref(empresa_id).document(documento)
                    doc = ref.get()

                    if doc.exists:
                        ref.set(payload, merge=True)
                        atualizados += 1
                    else:
                        ref.set({**payload, "criado_em": _now()}, merge=True)
                        inseridos += 1

                    # =========================
                    # 🔥 AQUI SINCRONIZA TÍTULOS
                    # =========================
                    titulos = c.get("titulos") or []

                    for titulo in titulos:
                        cobrancas_ref(empresa_id).document(
                            str(titulo.get("id"))
                        ).set({
                            "empresa_id": empresa_id,
                            "cliente_id": titulo.get("cliente_id"),
                            "cliente_nome": c.get("nome"),
                            "valor": titulo.get("valor"),
                            "valor_pago": titulo.get("valorPago"),
                            "status": titulo.get("status"),
                            "data_vencimento": titulo.get("dataVencimento"),
                            "data_pagamento": titulo.get("dataPagamento"),
                            "numero_documento": titulo.get("numeroDocumento"),
                            "linha_digitavel": titulo.get("linhaDigitavel"),
                            "codigo_barras": titulo.get("codigoBarras"),
                            "codigo_pix": titulo.get("codigoPix"),
                            "link_boleto": titulo.get("link"),
                            "origem": "sgp",
                            "sincronizado_em": _now()
                        }, merge=True)

                        total_titulos += 1

                except Exception as e:
                    erros.append({"documento": c.get("cpfcnpj"), "erro": str(e)})

            total_lidos += len(clientes)
            offset += limit

            _update_job(
                job_ref,
                status="running",
                message=f"Lidos {total_lidos} clientes...",
                progress=min(99, (total_lidos // limit)),
                total_lidos=total_lidos,
                inseridos=inseridos,
                atualizados=atualizados,
                titulos_sincronizados=total_titulos
            )

        _update_job(
            job_ref,
            status="done",
            progress=100,
            message="Sincronização concluída ✅",
            total_lidos=total_lidos,
            inseridos=inseridos,
            atualizados=atualizados,
            titulos_sincronizados=total_titulos,
            erros=erros
        )

    except Exception as e:
        _update_job(job_ref, status="error", message=str(e))


@router.get("/empresa/{empresa_id}")
def listar_clientes_empresa(empresa_id: str):
    docs = clientes_ref(empresa_id).stream()

    clientes = []
    for doc in docs:
        c = doc.to_dict()
        c["id"] = doc.id
        clientes.append(c)

    return clientes


@router.post("/sync/sgp/{empresa_id}/all-job")
def start_sync_clientes_sgp_all_job(empresa_id: str, background_tasks: BackgroundTasks, limit: int = 50):
    job_ref = sync_jobs_ref(empresa_id).document()
    job_ref.set({
        "empresa_id": empresa_id,
        "tipo": "clientes_all",
        "integracao_tipo": "sgp",
        "status": "queued",
        "created_at": _now(),
        "updated_at": _now(),
        "progress": 0,
        "message": "Job criado",
        "limit": limit,
        "total_lidos": 0,
        "inseridos": 0,
        "atualizados": 0,
    })

    background_tasks.add_task(run_sync_clientes_sgp_all_job, job_ref.id, empresa_id, limit)

    return {"ok": True, "job_id": job_ref.id, "status": "queued"} 