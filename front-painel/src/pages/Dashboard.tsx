import { useEffect, useState, useRef } from "react";
import api from "../services/api";

import "../styles/dashboard.css";

import DashboardCard from "../components/DashboardCard";
import DashboardPanel from "../components/DashboardPanel";

import {
  FaUsers,
  FaUserSlash,
  FaFileInvoiceDollar,
  FaExclamationTriangle,
  FaNetworkWired,
  FaMoneyBillWave,
} from "react-icons/fa";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


const EMPRESA_ID = localStorage.getItem("empresa_id") || "";

interface Cliente {
  id: string;
  conexao_status?: string;
}

interface Cobranca {
  id: string;
  status: string;
  valor: number;
}

interface BotStats {
  enviadas: number;
  recebidas: number;
  lidas: number;
  erros: number;
  bloqueadas: number;
  grafico: {
    data: string;
    quantidade: number;
  }[];
}

// 🔥 CACHE GLOBAL EM MEMÓRIA
let dashboardCache: Record<
  string,
  {
    clientes: Cliente[];
    cobrancas: Cobranca[];
    botStats: BotStats | null;
  }
> = {};

const Dashboard = () => {
  const jaCarregou = useRef(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [botStats, setBotStats] = useState<BotStats | null>(null);

  useEffect(() => {
    if (!jaCarregou.current) {
      carregarDados();
      jaCarregou.current = true;
    }
  }, []);

  async function carregarDados() {
    try {
      if (dashboardCache[EMPRESA_ID]) {
  setClientes(dashboardCache[EMPRESA_ID].clientes);
  setCobrancas(dashboardCache[EMPRESA_ID].cobrancas);
  setBotStats(dashboardCache[EMPRESA_ID].botStats);
  return;
}


const [clientesRes, cobrancasRes] = await Promise.all([
  api.get(`/clientes/empresa/${EMPRESA_ID}`),
  api.get(`/cobrancas/empresa/${EMPRESA_ID}`),
]);

let botRes = { data: null };

try {
  botRes = await api.get(`/bot/stats/${EMPRESA_ID}`);
} catch {
  console.warn("Bot stats ainda não disponível");
}
      const dados = {
        clientes: clientesRes.data,
        cobrancas: cobrancasRes.data,
        botStats: botRes.data,
      };

     dashboardCache[EMPRESA_ID] = dados;

      setClientes(dados.clientes);
      setCobrancas(dados.cobrancas);
      setBotStats(dados.botStats);
    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    }
  }

  // =============================
  // CONTAGENS CORRIGIDAS
  // =============================

  // ✅ CLIENTES
  const clientesAtivos = clientes.filter(
  (c) => c.conexao_status?.toLowerCase() === "online"
).length;

const clientesBloqueados = clientes.filter(
  (c) => c.conexao_status?.toLowerCase() !== "online"
).length;

  // ✅ COBRANÇAS (somente status "aberto")
  const totalPendentes = cobrancas.filter(
    (c) => c.status?.toLowerCase() === "aberto"
  );

  const totalPagas = cobrancas.filter(
    (c) => c.status?.toLowerCase() === "pago"
  );

  const valorEmAberto = totalPendentes.reduce(
    (acc, curr) => acc + curr.valor,
    0
  );

  const faturamentoPago = totalPagas.reduce(
    (acc, curr) => acc + curr.valor,
    0
  );

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      <div className="dashboard-top">
        <DashboardCard
          title="Clientes Ativos"
          value={clientesAtivos.toString()}
          icon={<FaUsers />}
          variant="primary"
        />

        <DashboardCard
          title="Bloqueados"
          value={clientesBloqueados.toString()}
          icon={<FaUserSlash />}
          variant="danger"
        />

        <DashboardCard
          title="Total Cobranças"
          value={cobrancas.length.toString()}
          icon={<FaFileInvoiceDollar />}
          variant="warning"
        />

        <DashboardCard
          title="Em Aberto"
          value={valorEmAberto.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          icon={<FaMoneyBillWave />}
          variant="success"
        />
      </div>

      <div className="dashboard-panels">
        <DashboardPanel
          title="Atenção"
          icon={<FaExclamationTriangle />}
          variant="attention"
        >
          <ul>
            <li>{clientesBloqueados} clientes bloqueados</li>
            <li>{totalPendentes.length} faturas em aberto</li>
          </ul>
        </DashboardPanel>

        <DashboardPanel
          title="Rede"
          icon={<FaNetworkWired />}
          variant="network"
        >
          <ul>
            <li>{clientesAtivos} clientes ativos</li>
            <li>Monitoramento ativo</li>
          </ul>
        </DashboardPanel>

        <DashboardPanel
          title="Financeiro"
          icon={<FaMoneyBillWave />}
          variant="finance"
        >
          <ul>
            <li>
              Faturamento pago:{" "}
              {faturamentoPago.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </li>
            <li>{totalPendentes.length} em aberto</li>
          </ul>
        </DashboardPanel>
      </div>

      <div className="dashboard-messages-block">
        <div className="messages-card">
          <div className="messages-header">
            <h3>Mensagens — Esta Semana</h3>
          </div>

          <div style={{ width: "100%", height: 280, marginTop: 40 }}>
            <ResponsiveContainer>
              <LineChart data={botStats?.grafico || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="quantidade"
                  stroke="#64748b"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="messages-metrics">
            <div className="messages-metric success">
              <strong>{botStats?.enviadas || 0}</strong>
              <span>Enviadas</span>
            </div>

            <div className="messages-metric">
              <strong>{botStats?.recebidas || 0}</strong>
              <span>Recebidas</span>
            </div>

            <div className="messages-metric">
              <strong>{botStats?.lidas || 0}</strong>
              <span>Lidas</span>
            </div>

            <div className="messages-metric warning">
              <strong>{botStats?.bloqueadas || 0}</strong>
              <span>Bloqueadas</span>
            </div>

            <div className="messages-metric danger">
              <strong>{botStats?.erros || 0}</strong>
              <span>Erros</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;