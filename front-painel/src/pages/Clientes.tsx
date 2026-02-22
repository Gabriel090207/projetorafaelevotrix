import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Select from "../components/Select";

import "../styles/clientes.css";
import {
  FiSearch,
  FiUserPlus,
  FiLock,
  FiMoreHorizontal,
  FiRefreshCw,
} from "react-icons/fi";

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  conexao_status?: string;
}

const EMPRESA_ID = "empresa_teste";

const Clientes = () => {
  // 🔥 STATE já inicia com cache (SEM DELAY)
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const cache = localStorage.getItem("clientes_cache");
    return cache ? JSON.parse(cache) : [];
  });

  const [status, setStatus] = useState("todos");
  const [busca, setBusca] = useState("");
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  // =========================
  // Atualiza silenciosamente
  // =========================
  useEffect(() => {
    async function atualizarClientes() {
      try {
        const response = await api.get("/clientes/");

        setClientes(response.data);

        // atualiza cache
        localStorage.setItem(
          "clientes_cache",
          JSON.stringify(response.data)
        );
      } catch (error) {
        console.error("Erro ao atualizar clientes", error);
      }
    }

    atualizarClientes();
  }, []);

  // =========================
  // SINCRONIZAR
  // =========================
async function sincronizarClientes() {
  try {
    setSyncLoading(true);
    setSyncMsg("Iniciando sincronização...");

    await api.post(
  `/clientes/sync/sgp/${EMPRESA_ID}/all-job`
);

    setSyncMsg("Sincronização iniciada em background 🔄");

  } catch (e) {
    console.error(e);
    setSyncMsg("Erro ao sincronizar ❌");
  } finally {
    setSyncLoading(false);
  }
}

  // =========================
  // FILTRO + ORDEM
  // =========================
  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return clientes
      .filter((c) => {
        const matchStatus =
          status === "todos"
            ? true
            : (c.conexao_status || "offline") === status;

        const matchBusca =
          !termo ||
          (c.nome || "").toLowerCase().includes(termo) ||
          (c.email || "").toLowerCase().includes(termo) ||
          (c.telefone || "").toLowerCase().includes(termo);

        return matchStatus && matchBusca;
      })
      .sort((a, b) =>
        (a.nome || "").localeCompare(b.nome || "", "pt-BR", {
          sensitivity: "base",
        })
      );
  }, [clientes, status, busca]);

  return (
    <div className="clientes-page">
      {/* HEADER */}
      <div className="clientes-header">
        <h1>Clientes</h1>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="btn-primary"
            onClick={sincronizarClientes}
            disabled={syncLoading}
            title="Sincronizar clientes"
          >
            <FiRefreshCw />
            {syncLoading ? "Sincronizando..." : "Sincronizar"}
          </button>

          <button className="btn-primary">
            <FiUserPlus />
            Novo Cliente
          </button>
        </div>
      </div>

      {syncMsg && (
        <div style={{ marginTop: 10, marginBottom: 10, opacity: 0.9 }}>
          <small>{syncMsg}</small>
        </div>
      )}

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
          ]}
        />

        <div className="filter-group search">
          <label>Buscar</label>
          <div className="search-input">
            <FiSearch />
            <input
              placeholder="Nome, e-mail ou telefone"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
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
            {clientesFiltrados.map((cliente) => (
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

            {clientesFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 16, opacity: 0.7 }}>
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clientes;