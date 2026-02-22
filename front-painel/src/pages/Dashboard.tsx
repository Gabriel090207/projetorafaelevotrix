import { useEffect, useState } from "react";
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

const Dashboard = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [botStats, setBotStats] = useState<BotStats | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [clientesRes, cobrancasRes, botRes] = await Promise.all([
        api.get("/clientes/"),
        api.get("/cobrancas/"),
        api.get("/bot/stats"),
      ]);

      setClientes(clientesRes.data || []);
      setCobrancas(cobrancasRes.data || []);
      setBotStats(botRes.data || null);
    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    }
  }

  // =============================
  // CLIENTES
  // =============================

  const clientesOnline = clientes.filter(
    (c) => c.conexao_status === "online"
  );

  const clientesOffline = clientes.filter(
    (c) => c.conexao_status === "offline"
  );

  const clientesAtivos = clientesOnline.length;
  const clientesBloqueados = clientesOffline.length;

  // =============================
  // COBRANÇAS
  // =============================

  const totalEmAberto = cobrancas.filter(
    (c) =>
      c.status === "em_aberto" ||
      c.status === "pendente" ||
      c.status === "aberto"
  );

  const totalPagas = cobrancas.filter(
    (c) => c.status === "pago"
  );

  const valorEmAberto = totalEmAberto.reduce(
    (acc, curr) => acc + (curr.valor || 0),
    0
  );

  const faturamentoPago = totalPagas.reduce(
    (acc, curr) => acc + (curr.valor || 0),
    0
  );

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      {/* =======================
          CARDS SUPERIORES
      ======================= */}
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

      {/* =======================
          PAINÉIS
      ======================= */}
      <div className="dashboard-panels">
        <DashboardPanel
          title="Atenção"
          icon={<FaExclamationTriangle />}
          variant="attention"
        >
          <ul>
            <li>{clientesBloqueados} clientes offline</li>
            <li>{totalEmAberto.length} faturas em aberto</li>
          </ul>
        </DashboardPanel>

        <DashboardPanel
          title="Rede"
          icon={<FaNetworkWired />}
          variant="network"
        >
          <ul>
            <li>{clientesAtivos} clientes online</li>
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
            <li>{totalEmAberto.length} em aberto</li>
          </ul>
        </DashboardPanel>
      </div>

      {/* =======================
          BOT ANALYTICS
      ======================= */}
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