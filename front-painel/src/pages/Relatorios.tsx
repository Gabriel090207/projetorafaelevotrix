import { useEffect, useState } from "react";
import api from "../services/api";

import "../styles/relatorios.css";
import {
  FaUser,
  FaMoneyBillWave,
  FaNetworkWired,
  FaFileAlt,
  FaSearch,
  FaEye,
  FaDownload,
} from "react-icons/fa";

interface Cliente {
  id: string;
  nome: string;
  status: string;
  data_criacao?: string;
}

const Relatorios = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tipoRelatorio, setTipoRelatorio] =
    useState<string>("clientes");

  async function carregarClientes() {
    try {
      setLoading(true);
      const response = await api.get("/clientes");
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao carregar relatório de clientes", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tipoRelatorio === "clientes") {
      carregarClientes();
    }
  }, [tipoRelatorio]);

  return (
    <div className="relatorios-page">
      {/* HEADER */}
      <div className="relatorios-header">
        <h1>Relatórios</h1>
      </div>

      {/* TIPOS */}
      <div className="relatorios-cards">
        <div
          className={`relatorio-card ${
            tipoRelatorio === "clientes" ? "active" : ""
          }`}
          onClick={() => setTipoRelatorio("clientes")}
        >
          <FaUser />
          <span>Clientes</span>
        </div>

        <div
          className={`relatorio-card ${
            tipoRelatorio === "financeiro" ? "active" : ""
          }`}
          onClick={() => setTipoRelatorio("financeiro")}
        >
          <FaMoneyBillWave />
          <span>Financeiro</span>
        </div>

        <div
          className={`relatorio-card ${
            tipoRelatorio === "conexao" ? "active" : ""
          }`}
          onClick={() => setTipoRelatorio("conexao")}
        >
          <FaNetworkWired />
          <span>Conexão</span>
        </div>

        <div
          className={`relatorio-card ${
            tipoRelatorio === "os" ? "active" : ""
          }`}
          onClick={() => setTipoRelatorio("os")}
        >
          <FaFileAlt />
          <span>Ordens de Serviço</span>
        </div>
      </div>

      {/* FILTROS */}
      <div className="relatorios-filters">
        <div className="filter-group">
          <label>Período</label>
          <select>
            <option>Hoje</option>
            <option>Últimos 7 dias</option>
            <option>Últimos 30 dias</option>
            <option>Personalizado</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select>
            <option>Todos</option>
            <option>Ativo</option>
            <option>Bloqueado</option>
          </select>
        </div>

        <div className="filter-group search">
          <label>Buscar</label>
          <div className="search-input">
            <FaSearch />
            <input placeholder="Nome ou código" />
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="relatorios-table-wrapper">
        <table className="relatorios-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>Carregando...</td>
              </tr>
            ) : tipoRelatorio === "clientes" ? (
              clientes.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.nome}</td>
                    <td>Cliente</td>

                    <td>
                      <span
                        className={`status ${
                          cliente.status === "ativo"
                            ? "online"
                            : "offline"
                        }`}
                      >
                        {cliente.status === "ativo"
                          ? "Ativo"
                          : "Bloqueado"}
                      </span>
                    </td>

                    <td>
                      {cliente.data_criacao
                        ? new Date(
                            cliente.data_criacao
                          ).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>

                    <td className="actions">
                      <FaEye />
                      <FaDownload />
                    </td>
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan={5}>
                  Relatório ainda não implementado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Relatorios;
