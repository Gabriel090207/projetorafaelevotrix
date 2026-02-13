import { useEffect, useState } from "react";
import api from "../services/api";
import Select from "../components/Select";

import "../styles/clientes.css";
import {
  FiSearch,
  FiUserPlus,
  FiLock,
  FiMoreHorizontal,
} from "react-icons/fi";

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  conexao_status?: string;
}

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [status, setStatus] = useState("todos");

  async function carregarClientes() {
    try {
      const response = await api.get("/clientes");
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao carregar clientes", error);
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  return (
    <div className="clientes-page">
      {/* HEADER */}
      <div className="clientes-header">
        <h1>Clientes</h1>

        <button className="btn-primary">
          <FiUserPlus />
          Novo Cliente
        </button>
      </div>

      {/* FILTROS */}
      <div className="clientes-filters">
        <div className="filter-group">
          <label>Central</label>
          <select>
            <option>Todas</option>
            <option>Central 1</option>
            <option>Central 2</option>
          </select>
        </div>

        <Select
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { label: "Todos", value: "todos" },
            { label: "Online", value: "online" },
            { label: "Offline", value: "offline" },
            { label: "Bloqueado", value: "bloqueado" },
          ]}
        />

        <div className="filter-group search">
          <label>Buscar</label>
          <div className="search-input">
            <FiSearch />
            <input placeholder="Nome, e-mail ou telefone" />
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="clientes-table-wrapper">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Celular</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.nome}</td>
                <td>{cliente.email}</td>
                <td>{cliente.telefone}</td>

                <td>
                  <span
                    className={`status ${
                      cliente.conexao_status === "online"
                        ? "online"
                        : "offline"
                    }`}
                  >
                    {cliente.conexao_status === "online"
                      ? "Online"
                      : "Offline"}
                  </span>
                </td>

                <td className="actions">
                  <FiLock />
                  <FiMoreHorizontal />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clientes;
