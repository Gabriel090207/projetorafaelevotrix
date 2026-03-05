import { useEffect, useState } from "react";
import api from "../../../services/api";

import "../../../styles/os.css";

import {
  FaClipboardList,
  
  FaPlus,
} from "react-icons/fa";

import {

  FiSearch

} from "react-icons/fi";

const EMPRESA_ID = localStorage.getItem("empresa_id") || "";

interface OrdemServico {
  id: string;
  cliente_nome: string;
  tecnico_nome: string;
  status: string;
  data_abertura: string;
}

interface Cliente {
  id: string;
  nome: string;
}

interface Tecnico {
  id: string;
  nome: string;
}

let osCache: OrdemServico[] | null = null;

const OrdemServico = () => {

  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    cliente_id: "",
    tecnico_id: "",
    descricao: "",
  });

  async function carregarOS() {

    try {

      if (osCache) {
        setOrdens(osCache);
        return;
      }

      const response = await api.get(
        `/ordens-servico/empresa/${EMPRESA_ID}`
      );

      osCache = response.data;
      setOrdens(response.data);

    } catch (error) {
      console.error("Erro ao carregar OS", error);
    }

  }

  async function carregarClientes() {

    const response = await api.get(
      `/clientes/empresa/${EMPRESA_ID}`
    );

    setClientes(response.data);

  }

  async function carregarTecnicos() {

    const response = await api.get(
      `/tecnicos/empresa/${EMPRESA_ID}`
    );

    setTecnicos(response.data);

  }

  useEffect(() => {

    carregarOS();
    carregarClientes();
    carregarTecnicos();

  }, []);

  function formatarData(data: string) {

    const d = new Date(data);
    return d.toLocaleDateString("pt-BR");

  }

  async function criarOS() {

    try {

      await api.post("/ordens-servico", {
        ...form,
        empresa_id: EMPRESA_ID,
      });

      setModalOpen(false);

      osCache = null;

      carregarOS();

    } catch (error) {

      console.error("Erro ao criar OS");

    }

  }

  return (

    <div className="os-page">

      {/* HEADER */}

      <div className="os-header">

        <h1>Ordens de Serviço</h1>

        <button
          className="btn-primary"
          onClick={() => setModalOpen(true)}
        >
          <FaPlus />
          Nova OS
        </button>

      </div>

      {/* KPIs */}

      <div className="os-kpis">

        <div className="kpi-card primary">
          <span>Total OS</span>
          <strong>{ordens.length}</strong>
        </div>

        <div className="kpi-card warning">
          <span>Em andamento</span>
          <strong>
            {ordens.filter(o => o.status === "andamento").length}
          </strong>
        </div>

        <div className="kpi-card success">
          <span>Concluídas</span>
          <strong>
            {ordens.filter(o => o.status === "concluida").length}
          </strong>
        </div>

      </div>

      {/* FILTROS */}

      <div className="os-filters">

        <div className="filter-group">

          <label>Status</label>

          <select>
            <option>Todos</option>
            <option>Aberto</option>
            <option>Andamento</option>
            <option>Concluído</option>
          </select>

        </div>

        <div className="filter-group search">

          <label>Buscar</label>

          <div className="search-input">

            <FiSearch />

            <input placeholder="Buscar cliente ou OS" />

          </div>

        </div>

      </div>

      {/* TABELA */}

      <div className="os-table-wrapper">

        <table className="os-table">

          <thead>
            <tr>
              <th>Cliente</th>
              <th>Técnico</th>
              <th>Abertura</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>

            {ordens.map((os) => (

              <tr key={os.id}>

                <td>{os.cliente_nome}</td>

                <td>{os.tecnico_nome}</td>

                <td>{formatarData(os.data_abertura)}</td>

                <td>

                  <span
                    className={`status ${
                      os.status === "concluida"
                        ? "success"
                        : os.status === "andamento"
                        ? "warning"
                        : "open"
                    }`}
                  >

                    {os.status === "concluida"
                      ? "Concluída"
                      : os.status === "andamento"
                      ? "Em andamento"
                      : "Aberta"}

                  </span>

                </td>

                <td className="actions">

                  <FaClipboardList />

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* MODAL */}

      {modalOpen && (

        <div className="ftth-modal">

          <div className="ftth-modal-content">

            <div className="ftth-modal-header">

              <h3>Nova Ordem de Serviço</h3>

              <button
                className="ftth-modal-close"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>

            </div>

            <div className="ftth-modal-form">

              <label>Cliente</label>

              <select
                onChange={(e) =>
                  setForm({ ...form, cliente_id: e.target.value })
                }
              >

                <option>Selecione</option>

                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}

              </select>

              <label>Técnico</label>

              <select
                onChange={(e) =>
                  setForm({ ...form, tecnico_id: e.target.value })
                }
              >

                <option>Selecione</option>

                {tecnicos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}

              </select>

              <label>Descrição</label>

              <input
                placeholder="Descrição da OS"
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
              />

            </div>

            <div className="ftth-modal-actions">

              <button
                className="ftth-btn-secondary"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>

              <button
                className="ftth-btn-primary"
                onClick={criarOS}
              >
                Criar OS
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
};

export default OrdemServico;