import requests
from requests.auth import HTTPBasicAuth

class MKAuth:

    def __init__(self):
        self.base_url = "https://SEU_IP_AQUI/api"
        self.username = "SEU_USUARIO"
        self.password = "SUA_SENHA"

        self.auth = HTTPBasicAuth(self.username, self.password)

    def listar_clientes(self, pagina=1, limite=50):
        url = f"{self.base_url}/cliente/listar"
        params = {
            "pagina": pagina,
            "limite": limite
        }

        response = requests.get(url, auth=self.auth, params=params)

        if response.status_code != 200:
            return {"erro": response.text}

        return response.json()
