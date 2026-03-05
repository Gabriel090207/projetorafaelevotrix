import requests
from requests.auth import HTTPBasicAuth
from app.core.firebase import db


class MKAuth:

    def __init__(self, empresa_id: str):

        docs = (
            db.collection("empresas")
            .document(empresa_id)
            .collection("integracoes")
            .where("tipo", "==", "mk_auth")
            .where("ativo", "==", True)
            .stream()
        )

        config = None

        for doc in docs:
            config = doc.to_dict()

        if not config:
            raise Exception("Integração MK-AUTH não configurada")

        dados = config["config"]

        # campos vindos do Evotrix
        self.base_url = dados["url"].rstrip("/")
        self.client_id = dados["app_key"]
        self.client_secret = dados["secret_key"]

        self.basic_auth = HTTPBasicAuth(
            self.client_id,
            self.client_secret
        )

        self.token = None

    # ==============================
    # AUTENTICAR NO MKAUTH
    # ==============================

    def autenticar(self):

        url = f"{self.base_url}/api/"

        response = requests.get(
            url,
            auth=self.basic_auth,
            verify=False
        )

        if response.status_code != 200:
            raise Exception("Erro ao autenticar no MKAuth")

        data = response.json()

        self.token = data.get("token")

    # ==============================
    # HEADERS COM TOKEN
    # ==============================

    def headers(self):

        if not self.token:
            self.autenticar()

        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    # ==============================
    # LISTAR CLIENTES
    # ==============================

    def listar_clientes(self, pagina=1):

        url = f"{self.base_url}/api/cliente/listar/pagina={pagina}"

        response = requests.get(
            url,
            headers=self.headers(),
            verify=False
        )

        if response.status_code != 200:
            return {
                "ok": False,
                "erro": response.text
            }

        return response.json()

    # ==============================
    # BUSCAR CLIENTE
    # ==============================

    def buscar_cliente(self, login):

        url = f"{self.base_url}/api/cliente/show/{login}"

        response = requests.get(
            url,
            headers=self.headers(),
            verify=False
        )

        if response.status_code != 200:
            return {
                "ok": False,
                "erro": response.text
            }

        return response.json()

    # ==============================
    # CRIAR CLIENTE
    # ==============================

    def criar_cliente(
        self,
        nome,
        login,
        senha,
        cpf
    ):

        url = f"{self.base_url}/api/cliente/inserir"

        payload = {
            "nome": nome,
            "login": login,
            "senha": senha,
            "cpf": cpf
        }

        response = requests.post(
            url,
            headers=self.headers(),
            json=payload,
            verify=False
        )

        if response.status_code != 200:
            return {
                "ok": False,
                "erro": response.text
            }

        return response.json()

    # ==============================
    # EDITAR CLIENTE
    # ==============================

    def editar_cliente(self, payload):

        url = f"{self.base_url}/api/cliente/editar"

        response = requests.put(
            url,
            headers=self.headers(),
            json=payload,
            verify=False
        )

        if response.status_code != 200:
            return {
                "ok": False,
                "erro": response.text
            }

        return response.json()

    # ==============================
    # REMOVER CLIENTE
    # ==============================

    def remover_cliente(self, cliente_id):

        url = f"{self.base_url}/api/cliente/{cliente_id}"

        response = requests.delete(
            url,
            headers=self.headers(),
            verify=False
        )

        if response.status_code != 200:
            return {
                "ok": False,
                "erro": response.text
            }

        return response.json()