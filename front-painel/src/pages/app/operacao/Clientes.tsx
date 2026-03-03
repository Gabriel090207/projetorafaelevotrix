import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import Select from "../../../components/Select";

import "../../../styles/clientes.css";
import {
  FiSearch,
  FiUserPlus,
  FiRefreshCw,
  FiMenu,
  FiEdit,
  FiKey,
   FiWifi,
  FiDollarSign,
  FiLock,
  FiCpu,
  FiEye
} from "react-icons/fi";

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  conexao_status?: string;
}


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


  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [openDetails, setOpenDetails] = useState(false);
const [clienteDetalhe, setClienteDetalhe] = useState<any>(null);
const [loadingDetalhe, setLoadingDetalhe] = useState(false);


const [contratoSelecionado, setContratoSelecionado] = useState<any>(null);

const [openFinanceiro, setOpenFinanceiro] = useState(false);



const [openWifi, setOpenWifi] = useState(false);
const [wifiData, setWifiData] = useState<any>(null);
const [loadingWifi, setLoadingWifi] = useState(false);
  // =========================
  // Atualiza silenciosamente
  // =========================
  useEffect(() => {
    async function atualizarClientes() {
      try {
       const response = await api.get(`/clientes`);

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
    setSyncMsg("Criando job de sincronização...");

    await api.post(`/clientes/sync/sgp/all-job`);

    setSyncMsg("Sincronização iniciada 🚀 Aguarde alguns minutos...");
    setSyncLoading(false);

  } catch (e) {
    console.error(e);
    setSyncMsg("Erro ao iniciar sincronização ❌");
    setSyncLoading(false);
  }
}


async function verDetalhes(id: string) {
  try {
    setLoadingDetalhe(true);
    const response = await api.get(`/clientes/${id}`);

    const cliente = response.data;
    setClienteDetalhe(cliente);

    if (cliente.sgp_raw?.contratos?.length > 0) {
      setContratoSelecionado(cliente.sgp_raw.contratos[0]);
    }

    setOpenDetails(true);
  } catch (e) {
    console.error("Erro ao buscar detalhes", e);
  } finally {
    setLoadingDetalhe(false);
  }
}

async function carregarWifiStatus() {
  try {
    setLoadingWifi(true);

    const response = await api.get(
      `/clientes/${clienteDetalhe.id}/wifi-status`
    );

    setWifiData(response.data);
  } catch (e) {
    console.error("Erro ao buscar status wifi", e);
  } finally {
    setLoadingWifi(false);
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


  useEffect(() => {
  if (!openWifi) return;

  carregarWifiStatus();

  const interval = setInterval(() => {
    carregarWifiStatus();
  }, 5000);

  return () => clearInterval(interval);
}, [openWifi]);

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
  <div className="options-wrapper">
    <button
      className="options-button"
      onClick={() =>
        setOpenMenuId(openMenuId === cliente.id ? null : cliente.id)
      }
    >
      <FiMenu />
    </button>

    {openMenuId === cliente.id && (
      <div className="options-menu">
        <div
  className="option-item"
  onClick={() => {
    setOpenMenuId(null);
    verDetalhes(cliente.id);
  }}
>
  <FiEye /> Ver detalhes
</div>

        <div className="option-item">
          <FiEdit /> Editar
        </div>

        <div className="option-item danger">
          <FiKey /> Resetar senha
        </div>
      </div>
    )}
  </div>
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





      {openDetails && clienteDetalhe && (
  <div className="modal-overlay" onClick={() => setOpenDetails(false)}>
    <div className="modal-large" onClick={(e) => e.stopPropagation()}>
      {loadingDetalhe ? (
        <div style={{ padding: 20 }}>Carregando...</div>
      ) : (
        <>
          <div className="modal-header">
            <h2>Cliente: {clienteDetalhe.nome}</h2>
          </div>

          <div className="cliente-info-grid">
  <div className="info-card">
    <span>CPF/CNPJ</span>
    <strong>{clienteDetalhe.documento}</strong>
  </div>

  <div className="info-card">
    <span>Telefone</span>
    <strong>
      {clienteDetalhe.telefone ||
        clienteDetalhe.sgp_raw?.contatos?.celulares?.[0]}
    </strong>
  </div>

  <div className="info-card">
    <span>E-mail</span>
    <strong>
      {clienteDetalhe.email ||
        clienteDetalhe.sgp_raw?.contatos?.emails?.[0]}
    </strong>
  </div>

  <div className="info-card">
    <span>Status</span>
    <strong className={
      clienteDetalhe.conexao_status === "online"
        ? "status-online"
        : "status-offline"
    }>
      {clienteDetalhe.conexao_status}
    </strong>
  </div>
</div>


{clienteDetalhe?.sgp_raw?.contratos?.length > 0 && (
  <div className="contrato-select-wrapper">
    <select
      className="contrato-select"
      value={contratoSelecionado?.id}
      onChange={(e) => {
        const contrato = clienteDetalhe.sgp_raw.contratos.find(
          (c: any) => String(c.id) === e.target.value
        );
        setContratoSelecionado(contrato);
      }}
    >
      {clienteDetalhe.sgp_raw.contratos.map((contrato: any) => (
        <option key={contrato.id} value={contrato.id}>
          Contrato {contrato.id} - {contrato.endereco?.logradouro} - {contrato.endereco?.cidade}
        </option>
      ))}
    </select>
  </div>
)}

{contratoSelecionado && (
  <div className="status-contrato-wrapper">
    <button
      className={
        contratoSelecionado.status === "Ativo"
          ? "btn-status ativo"
          : "btn-status bloqueado"
      }
    >
      {contratoSelecionado.status === "Ativo"
        ? "REGULAR / LIBERADO"
        : "BLOQUEADO"}
    </button>
  </div>
)}

{contratoSelecionado && (
  <div className="acoes-rapidas">
    <div
  className="acao-btn"
  onClick={() => {
    setOpenWifi(true);
  }}
>
  <FiWifi />
  Wi-Fi
</div>

   <button
  className="acao-btn"
  onClick={() => setOpenFinanceiro(true)}
>
  <FiDollarSign size={20} />
  <span>Financeiro</span>
</button>

    <button className="acao-btn">
      <FiLock size={20} />
      <span>Bloquear</span>
    </button>

    <button className="acao-btn">
      <FiCpu size={20} />
      <span>Equipamento</span>
    </button>
  </div>
)}

        </>
      )}
    </div>
  </div>
)}


{openFinanceiro && contratoSelecionado && (
  <div className="modal-overlay" onClick={() => setOpenFinanceiro(false)}>
    <div
      className="modal-financeiro"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-header financeiro-header">
  <button
    className="btn-voltar"
    onClick={() => setOpenFinanceiro(false)}
  >
    ← Voltar
  </button>

  <h2>
    Financeiro — Contrato {contratoSelecionado.id}
  </h2>
</div>

      <div className="financeiro-card">
        <table className="financeiro-table">
          <thead>
            <tr>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Atraso</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {clienteDetalhe.sgp_raw?.titulos
              ?.filter(
                (t: any) =>
                  t.clientecontrato_id === contratoSelecionado.id
              )
              .map((titulo: any) => (
                <tr key={titulo.id}>
                  <td>{titulo.dataVencimento}</td>
                  <td>R$ {Number(titulo.valor).toFixed(2)}</td>
                  <td
                    className={
                      titulo.status === "aberto"
                        ? "status-verde"
                        : titulo.status === "cancelado"
                        ? "status-vermelho"
                        : "status-pago"
                    }
                  >
                    {titulo.status}
                  </td>
                  <td>
                    {titulo.diasAtraso > 0
                      ? `${titulo.diasAtraso} dias`
                      : "-"}
                  </td>
                  <td>
                    <button
                      className="btn-boleto"
                      onClick={() =>
                        window.open(titulo.link, "_blank")
                      }
                    >
                      Ver boleto
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

{openWifi && (
  <div className="modal-overlay" onClick={() => setOpenWifi(false)}>
    <div
      className="modal-financeiro"
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER IGUAL FINANCEIRO */}
      <div className="financeiro-header">
        <button
          className="btn-voltar"
          onClick={() => setOpenWifi(false)}
        >
          ← Voltar
        </button>

        <h2>Status da Conexão</h2>
      </div>

      {/* CARD IGUAL FINANCEIRO */}
      <div className="financeiro-card">

        {/* STATUS + IP */}
        <div className="wifi-top">
          <div className="wifi-status">
            <span
              className={
                wifiData?.status === "online"
                  ? "badge-online"
                  : "badge-offline"
              }
            >
              {wifiData?.status?.toUpperCase() || "OFFLINE"}
            </span>

            <div className="wifi-ip">
              IP: {wifiData?.ip || "-"}
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="wifi-grid">
          <div className="wifi-item">
            <span>Última conexão</span>
            <strong>{wifiData?.ultima_conexao || "-"}</strong>
          </div>

          <div className="wifi-item">
            <span>Reconexões 24h</span>
            <strong>{wifiData?.reconexoes ?? 0}</strong>
          </div>

          <div className="wifi-item">
            <span>Download</span>
            <strong>{wifiData?.download || "0 MB"}</strong>
          </div>

          <div className="wifi-item">
            <span>Upload</span>
            <strong>{wifiData?.upload || "0 MB"}</strong>
          </div>

          <div className="wifi-item">
            <span>NAS</span>
            <strong>{wifiData?.nas || "-"}</strong>
          </div>

          <div className="wifi-item">
            <span>Service</span>
            <strong>{wifiData?.service || "-"}</strong>
          </div>
        </div>

        {/* BOTÕES */}
        <div className="wifi-actions">
          <button
            className="btn-red"
            onClick={carregarWifiStatus}
          >
            Atualizar
          </button>

          <button
            className="btn-red"
            onClick={async () => {
              await api.post(
                `/clientes/${clienteDetalhe.id}/reiniciar-onu`
              );
              carregarWifiStatus();
            }}
          >
            Reiniciar ONU
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Clientes;