from abc import ABC, abstractmethod


class BaseIntegration(ABC):

    def __init__(self, empresa_id: str, config: dict):
        self.empresa_id = empresa_id
        self.config = config

    @abstractmethod
    def testar_conexao(self):
        pass

    # =========================
    # CLIENTES
    # =========================
    @abstractmethod
    def listar_clientes(self):
        pass

    @abstractmethod
    def buscar_cliente(self, identificador: str):
        pass

    # =========================
    # COBRANÇAS
    # =========================
    @abstractmethod
    def listar_cobrancas(self):
        pass

    @abstractmethod
    def buscar_cobranca(self, external_id: str):
        pass

    # =========================
    # AÇÕES
    # =========================
    @abstractmethod
    def bloquear_cliente(self, external_id: str):
        pass

    @abstractmethod
    def desbloquear_cliente(self, external_id: str):
        pass