from fastapi import APIRouter, BackgroundTasks
from datetime import datetime
from app.core.firebase import db
from app.services.sgp_auth import SGPAuth

router = APIRouter(prefix="/jobs", tags=["Jobs"])


def _now():
    return datetime.utcnow().isoformat()


def run_sync_clientes_sgp(job_id: str, empresa_id: str, limit: int):
    job_ref = db.collection("sync_jobs").document(job_id)

    job_ref.update({"status": "running", "updated_at": _now()})

    sgp = SGPAuth(empresa_id)

    offset = 0
    total = 0

    while True:
        res = sgp.listar_clientes(limit=limit, offset=offset)

        if not res.get("ok"):
            job_ref.update({"status": "error"})
            return

        clientes = (res.get("dados") or {}).get("clientes") or []
        if not clientes:
            break

        for c in clientes:
            documento = c.get("cpfcnpj")
            if not documento:
                continue

            db.collection("empresas") \
                .document(empresa_id) \
                .collection("clientes") \
                .document(documento) \
                .set({
                    "nome": c.get("nome"),
                    "documento": documento,
                    "origem": "sgp",
                    "sincronizado_em": _now()
                }, merge=True)

            total += 1

        offset += limit

    job_ref.update({
        "status": "done",
        "total_lidos": total,
        "updated_at": _now()
    })


@router.post("/sync-clientes/{empresa_id}")
def start_job(empresa_id: str, background_tasks: BackgroundTasks, limit: int = 50):
    job_ref = db.collection("sync_jobs").document()
    job_ref.set({
        "empresa_id": empresa_id,
        "status": "queued",
        "created_at": _now()
    })

    background_tasks.add_task(run_sync_clientes_sgp, job_ref.id, empresa_id, limit)

    return {"job_id": job_ref.id}