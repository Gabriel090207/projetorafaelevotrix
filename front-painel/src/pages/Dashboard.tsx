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

interface Cliente {
  id: string;
  status?: string;
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
let dashboardCache: {
  clientes: Cliente[];
  cobrancas: Cobranca[];
  botStats: BotStats | null;
} | null = null;

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
      // 🔥 Se já tiver cache em memória, usa ele
      if (dashboardCache) {
        setClientes(dashboardCache.clientes);
        setCobrancas(dashboardCache.cobrancas);
        setBotStats(dashboardCache.botStats);
        return;
      }

      // 🔥 Só busca backend se não tiver cache
      const [clientesRes, cobrancasRes, botRes] = await Promise.all([
        api.get("/clientes"),
        api.get("/cobrancas"),
        api.get("/bot/stats"),
      ]);

      const dados = {
        clientes: clientesRes.data,
        cobrancas: cobrancasRes.data,
        botStats: botRes.data,
      };

      // salva no cache global
      dashboardCache = dados;

      setClientes(dados.clientes);
      setCobrancas(dados.cobrancas);
      setBotStats(dados.botStats);

    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    }
  }

  // =============================
  // CONTAGENS
  // =============================

  const clientesAtivos = clientes.filter(
    (c) => !c.status || c.status === "ativo"
  ).length;

  const clientesBloqueados = clientes.filter(
    (c) => c.status === "bloqueado"
  ).length;

  const totalPendentes = cobrancas.filter(
    (c) => c.status === "pendente"
  );

  const totalPagas = cobrancas.filter(
    (c) => c.status === "pago"
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
            <li>{totalPendentes.length} faturas pendentes</li>
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