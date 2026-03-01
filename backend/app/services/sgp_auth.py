import requests
from requests.exceptions import ReadTimeout
from app.core.firebase import db


class SGPAuth:
    def __init__(self, empresa_id: str):
        docs = (
            db.collection("empresas")
            .document(empresa_id)
            .collection("integracoes")
            .where("tipo", "==", "sgp")
            .where("ativo", "==", True)
            .stream()
        )               

        config = None
        for doc in docs:
            config = doc.to_dict()

        if not config:
            raise Exception("Integração SGP não configurada para esta empresa")

        dados = config["config"]

        self.base_url = dados["base_url"].rstrip("/")
        self.app = dados["app"]
        self.token = dados["token"]
        self.verify_ssl = dados.get("verify_ssl", True)

    # =====================================================
    # CONSULTA POR CPF/CNPJ
    # =====================================================
    def consultar_cliente_por_cpfcnpj(
        self,
        cpfcnpj: str,
        limit: int = 100,
        offset: int = 0,
    ):
        """
        POST {base_url}/api/ura/clientes/
        body: token, app, cpfcnpj, limit, offset
        """
        url = f"{self.base_url}/api/ura/clientes/"

        payload = {
            "token": self.token,
            "app": self.app,
            "cpfcnpj": cpfcnpj,
            "limit": limit,
            "offset": offset,
        }

        try:
            r = requests.post(
                url,
                data=payload,
                timeout=120,
                verify=self.verify_ssl,
            )
        except ReadTimeout:
            return {
                "ok": False,
                "erro": "Timeout ao consultar cliente no SGP",
                "timeout": 120,
            }

        if r.status_code != 200:
            return {
                "ok": False,
                "status_code": r.status_code,
                "erro": r.text,
            }

        data = r.json()

        # Alguns SGP já retornam { ok: true/false }
        if isinstance(data, dict) and "ok" in data:
            return data

        return {"ok": True, "dados": data}

    # =====================================================
    # LISTAR TODOS (SEM CPF)
    # =====================================================
    def listar_clientes(
        self,
        limit: int = 100,
        offset: int = 0,
    ):
        """
        Tenta listar clientes sem filtro de cpfcnpj.
        Alguns SGP aceitam cpfcnpj vazio.
        """

        url = f"{self.base_url}/api/ura/clientes/"

        payload = {
            "token": self.token,
            "app": self.app,
            "limit": limit,
            "offset": offset,
            "cpfcnpj": "",  # tentativa sem filtro
        }

        try:
            r = requests.post(
                url,
                data=payload,
                timeout=120,
                verify=self.verify_ssl,
            )
        except ReadTimeout:
            return {
                "ok": False,
                "erro": "Timeout ao listar clientes no SGP",
                "timeout": 120,
            }

        if r.status_code != 200:
            return {
                "ok": False,
                "status_code": r.status_code,
                "erro": r.text,
            }

        data = r.json()

        if isinstance(data, dict) and "ok" in data:
            return data

        return {"ok": True, "dados": data}