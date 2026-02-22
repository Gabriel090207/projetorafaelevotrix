# app/routers/sync.py

from fastapi import APIRouter, HTTPException, BackgroundTasks
from datetime import datetime
from typing import Optional, List

from app.core.firebase import db
from app.services.sgp_auth import SGPAuth

router = APIRouter(prefix="/sync", tags=["Sync"])


def _now() -> str:
    return datetime.utcnow().isoformat()


def _only_digits(s: Optional[str]) -> str:
    return "".join([c for c in (s or "") if c.isdigit()])


def _map_conexao_status_from_sgp(cliente_sgp: dict) -> str:
    """
    Regra:
    - Se vier REGULAR/LIBERADO/ATIVO => "online"
    - Senão => "offline"
    """
    status_txt = (cliente_sgp.get("status") or cliente_sgp.get("situacao") or "").upper()
    if "REGULAR" in status_txt or "LIBERADO" in status_txt or "ATIVO" in status_txt:
        return "online"
    return "offline"


def _pick_email(cliente_sgp: dict) -> str:
    # 1️⃣ direto na raiz
    email = (cliente_sgp.get("email") or "").strip()
    if email:
        return email

    # 2️⃣ lista simples na raiz
    emails = cliente_sgp.get("emails")
    if isinstance(emails, list) and emails:
        first = (emails[0] or "").strip()
        if first:
            return first

    # 3️⃣ dentro de contatos.emails  ✅ (SEU CASO)
    contatos = cliente_sgp.get("contatos") or {}
    if isinstance(contatos, dict):
        emails = contatos.get("emails")
        if isinstance(emails, list) and emails:
            first = (emails[0] or "").strip()
            if first:
                return first

    return ""


def _pick_telefone(cliente_sgp: dict) -> str:
    # 1️⃣ direto na raiz
    telefone = (
        cliente_sgp.get("celular")
        or cliente_sgp.get("telefone")
        or cliente_sgp.get("fone")
        or cliente_sgp.get("whatsapp")
        or ""
    )

    telefone = str(telefone).strip()
    if telefone:
        return telefone

    # 2️⃣ dentro de contatos.celulares ✅ (SEU CASO)
    contatos = cliente_sgp.get("contatos") or {}
    if isinstance(contatos, dict):
        celulares = contatos.get("celulares")
        if isinstance(celulares, list) and celulares:
            return str(celulares[0]).strip()

    return ""

def _pick_endereco(cliente_sgp: dict) -> str:
    end = cliente_sgp.get("endereco") or {}
    if not isinstance(end, dict):
        return ""

    endereco_txt = (
        f'{end.get("logradouro","")}, {end.get("numero","")}, {end.get("bairro","")}, '
        f'{end.get("cidade","")}-{end.get("uf","")}, CEP {end.get("cep","")}'
    )
    return endereco_txt.strip().strip(",")


def run_clientes_sync_job(job_id: str, empresa_id: str, integracao_tipo: str, payload: dict):
    job_ref = db.collection("sync_jobs").document(job_id)

    def update(**kwargs):
        kwargs["updated_at"] = _now()
        job_ref.update(kwargs)

    try:
        update(status="running", progress=0, message="Iniciando sincronização...")

        if integracao_tipo != "sgp":
            raise Exception(f"Integração '{integracao_tipo}' ainda não implementada.")

        sgp = SGPAuth(empresa_id)

        # ✅ estratégia atual: sync por CPF/CNPJ (lista)
        cpf_list: List[str] = payload.get("cpf_list", []) or []
        if not cpf_list:
            raise Exception("Para SGP, informe cpf_list (a API exige filtro cpfcnpj).")

        total = len(cpf_list)
        update(total=total, synced=0, message="Buscando clientes...")

        synced = 0

        for idx, cpf in enumerate(cpf_list, start=1):
            cpfcnpj = _only_digits(cpf)
            if not cpfcnpj:
                # ignora cpf vazio/ruim e segue
                progress = int((idx / total) * 100)
                update(progress=progress, message=f"CPF inválido ignorado ({idx}/{total})")
                continue

            # ✅ usa o método que você tem no SGPAuth que mandou
            resp = sgp.consultar_cliente_por_cpfcnpj(cpfcnpj)

            if not resp.get("ok"):
                # não mata o job por 1 cpf ruim; só registra e segue
                progress = int((idx / total) * 100)
                update(progress=progress, message=f"Falha SGP em {cpfcnpj} ({idx}/{total})")
                continue

            dados = resp.get("dados", {}) or {}
            clientes = dados.get("clientes", []) or []

            # Salva/atualiza clientes no Firebase
            for c in clientes:
                doc_cpfcnpj = _only_digits(c.get("cpfcnpj") or cpfcnpj)
                if not doc_cpfcnpj:
                    continue

                doc_id = doc_cpfcnpj  # doc por cpf/cnpj (único)

                email = _pick_email(c)
                telefone = _pick_telefone(c)
                endereco = _pick_endereco(c)
                conexao_status = _map_conexao_status_from_sgp(c)

                db.collection("clientes").document(doc_id).set(
                    {
                        "nome": c.get("nome") or "",
                        "documento": doc_cpfcnpj,
                        "email": email,
                        "telefone": telefone,
                        "endereco": endereco,
                        "conexao_status": conexao_status,

                        "origem": "sgp",
                        "empresa_id": empresa_id,

                        # ajuda a debug
                        "sgp_cliente_id": c.get("id"),
                        "sgp_status_raw": c.get("status") or c.get("situacao"),
                        "sgp_raw": c,

                        "atualizado_em": _now(),
                    },
                    merge=True,
                )

            synced += 1
            progress = int((idx / total) * 100)
            update(progress=progress, synced=synced, message=f"Sincronizando... ({idx}/{total})")

        update(status="done", progress=100, message="Sincronização concluída ✅")

    except Exception as e:
        update(status="error", message=str(e))


@router.post("/clientes")
def start_clientes_sync(
    empresa_id: str,
    background_tasks: BackgroundTasks,
    cpf_list: str = "",
):
    """
    Inicia um job de sync em background.

    Params:
    - empresa_id (query param)
    - cpf_list: string separada por vírgula.
      Ex: "12166675603,00000000000"
    """
    # Descobre integração ativa (ex.: sgp)
    docs = (
        db.collection("integracoes")
        .where("empresa_id", "==", empresa_id)
        .where("ativo", "==", True)
        .stream()
    )

    integracao = None
    for d in docs:
        integracao = d.to_dict()
        integracao["id"] = d.id
        break

    if not integracao:
        raise HTTPException(404, "Nenhuma integração ativa encontrada para essa empresa")

    integracao_tipo = integracao.get("tipo")

    # cria job
    job_data = {
        "empresa_id": empresa_id,
        "tipo": "clientes",
        "integracao_tipo": integracao_tipo,
        "status": "queued",
        "created_at": _now(),
        "updated_at": _now(),
        "progress": 0,
        "total": 0,
        "synced": 0,
        "message": "Job criado",
    }

    job_ref = db.collection("sync_jobs").document()
    job_ref.set(job_data)

    # payload do job
    parsed = [_only_digits(x.strip()) for x in (cpf_list or "").split(",") if x.strip()]
    payload = {"cpf_list": parsed}

    background_tasks.add_task(run_clientes_sync_job, job_ref.id, empresa_id, integracao_tipo, payload)

    return {"ok": True, "job_id": job_ref.id, "status": "queued"}


@router.get("/{job_id}")
def get_job(job_id: str):
    ref = db.collection("sync_jobs").document(job_id)
    doc = ref.get()
    if not doc.exists:
        raise HTTPException(404, "Job não encontrado")
    data = doc.to_dict()
    data["id"] = doc.id
    return data