import requests
from requests.auth import HTTPBasicAuth
from app.core.firebase import db


class MKAuth:
    def __init__(self, empresa_id: str):
        # Busca integração dentro da empresa (padrão do seu sistema)
        docs = (
            db.collection("empresas")
            .document(empresa_id)
            .collection("integracoes")
            .where("tipo", "==", "mk_auth")
            .where("ativo", "==", True)
            .stream()
        )

        integracao = None
        for doc in docs:
            integracao = doc.to_dict()

        if not integracao:
            raise Exception("Integração MK-AUTH não configurada")

        cfg = integracao.get("config") or {}

        self.base_url = str(cfg.get("base_url", "")).rstrip("/")
        self.client_id = cfg.get("client_id")
        self.client_secret = cfg.get("client_secret")

        if not self.base_url or not self.client_id or not self.client_secret:
            raise Exception("Config MK-AUTH incompleta (base_url/client_id/client_secret)")

        # opcional: permitir controlar SSL via config
        # cfg["verify_ssl"] pode ser True/False
        self.verify_ssl = bool(cfg.get("verify_ssl", False))

        self._basic = HTTPBasicAuth(self.client_id, self.client_secret)
        self._token = None

    # ==============================
    # AUTH (Basic -> Token JWT)
    # ==============================
    def autenticar(self) -> str:
        """
        GET /api/ com Basic Auth => retorna token JWT
        """
        url = f"{self.base_url}/api/"

        resp = requests.get(
            url,
            auth=self._basic,
            verify=self.verify_ssl
        )

        if resp.status_code != 200:
            raise Exception(f"Erro ao autenticar no MK-AUTH: {resp.status_code} - {resp.text}")

        data = resp.json() if resp.text else {}
        token = data.get("token") or data.get("access_token") or data.get("jwt")

        if not token:
            raise Exception("MK-AUTH não retornou token (campo token/access_token/jwt)")

        self._token = token
        return token

    def _headers(self) -> dict:
        if not self._token:
            self.autenticar()

        return {
            "Authorization": f"Bearer {self._token}",
            "Content-Type": "application/json",
        }

    # ==============================
    # REQUEST WRAPPER (auto reauth)
    # ==============================
    def _request(self, method: str, url: str, *, params=None, json=None):
        # 1ª tentativa
        resp = requests.request(
            method,
            url,
            headers=self._headers(),
            params=params,
            json=json,
            verify=self.verify_ssl
        )

        # Se token expirou / inválido, tenta renovar 1 vez
        if resp.status_code == 401:
            self._token = None
            resp = requests.request(
                method,
                url,
                headers=self._headers(),
                params=params,
                json=json,
                verify=self.verify_ssl
            )

        if resp.status_code not in (200, 201):
            return {"ok": False, "status_code": resp.status_code, "erro": resp.text}

        # Algumas rotas podem devolver vazio
        if not resp.text:
            return {"ok": True}

        try:
            return resp.json()
        except Exception:
            return {"ok": True, "raw": resp.text}

    # ==============================
    # CLIENTES
    # ==============================
    def listar_clientes(self, pagina: int = 1):
        # Swagger usa /api/cliente/listar/pagina=1
        url = f"{self.base_url}/api/cliente/listar/pagina={pagina}"

        # Se sua API também aceitar query ?pagina=, pode deixar params=None.
        # Mantive o path padrão do swagger.
        return self._request("GET", url)

    def buscar_cliente(self, login: str):
        url = f"{self.base_url}/api/cliente/show/{login}"
        return self._request("GET", url)

    def criar_cliente(
        self,
        *,
        nome: str,
        login: str,
        senha: str,
        cpf: str,
        email: str | None = None,
        telefone: str | None = None,
        celular: str | None = None,
        endereco: str | None = None,
        bairro: str | None = None,
        numero: str | None = None,
        complemento: str | None = None,
        cep: str | None = None,
        cidade: str | None = None,
        estado: str | None = None,
        rg: str | None = None,
        data_nasc: str | None = None,
    ):
        """
        POST /api/cliente/inserir

        Pelo swagger, obrigatórios:
        - nome
        - Login (login)
        - senha
        - cpf

        Observação: em alguns lugares aparece `Login` com L maiúsculo.
        Para evitar erro, envio os dois: login e Login.
        """
        url = f"{self.base_url}/api/cliente/inserir"

        payload = {
            "nome": nome,
            "login": login,
            "Login": login,   # compatibilidade caso a API use L maiúsculo
            "senha": senha,
            "cpf": cpf,
        }

        # opcionais
        if email: payload["email"] = email
        if telefone: payload["telefone"] = telefone
        if celular: payload["celular"] = celular
        if endereco: payload["endereco"] = endereco
        if bairro: payload["bairro"] = bairro
        if numero: payload["numero"] = numero
        if complemento: payload["complemento"] = complemento
        if cep: payload["cep"] = cep
        if cidade: payload["cidade"] = cidade
        if estado: payload["estado"] = estado
        if rg: payload["rg"] = rg
        if data_nasc: payload["data_nasc"] = data_nasc

        return self._request("POST", url, json=payload)

    def editar_cliente(self, payload: dict):
        """
        PUT /api/cliente/editar
        Aqui depende do que seu MK-Auth exige no body.
        Então deixei genérico: você manda o dict que a doc pede.
        """
        url = f"{self.base_url}/api/cliente/editar"
        return self._request("PUT", url, json=payload)

    def remover_cliente(self, cliente_id: str):
        """
        DELETE /api/cliente/{id}
        """
        url = f"{self.base_url}/api/cliente/{cliente_id}"
        return self._request("DELETE", url)