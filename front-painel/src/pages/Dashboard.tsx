import "../styles/dashboard.css";

import DashboardCard from "../components/DashboardCard";
import DashboardPanel from "../components/DashboardPanel";

import {
  FaUsers,
  FaWifi,
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

const messagesChartData = [
  { date: "29/01", value: 22 },
  { date: "30/01", value: 233 },
  { date: "31/01", value: 115 },
  { date: "01/02", value: 184 },
  { date: "02/02", value: 134 },
  { date: "03/02", value: 77 },
  { date: "04/02", value: 76 },
  { date: "05/02", value: 1 },
];

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      {/* =======================
          CARDS SUPERIORES
      ======================= */}
      <div className="dashboard-top">
        <DashboardCard
          title="Clientes Ativos"
          value="1.248"
          icon={<FaUsers />}
          variant="primary"
        />

        <DashboardCard
          title="Online Agora"
          value="1.102"
          icon={<FaWifi />}
          variant="success"
          subtitle="PPPoE / DHCP / Hotspot"
        />

        <DashboardCard
          title="Offline"
          value="146"
          icon={<FaUserSlash />}
          variant="danger"
          subtitle="Possíveis desconectados"
        />

        <DashboardCard
          title="Em Aberto"
          value="R$ 84.230"
          icon={<FaFileInvoiceDollar />}
          variant="warning"
          subtitle="Faturas pendentes"
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
            <li>3 clientes offline há mais de 30 minutos</li>
            <li>5 boletos vencidos hoje</li>
            <li>2 ordens de serviço abertas</li>
          </ul>
        </DashboardPanel>

        <DashboardPanel title="Rede" icon={<FaNetworkWired />} variant="network">
          <ul>
            <li>1.102 clientes online</li>
            <li>4 OLTs ativas</li>
            <li>PPPoE • DHCP • Hotspot</li>
          </ul>
        </DashboardPanel>

        <DashboardPanel
          title="Financeiro"
          icon={<FaMoneyBillWave />}
          variant="finance"
        >
          <ul>
            <li>Faturamento do mês: R$ 124.000</li>
            <li>18 faturas em aberto</li>
            <li>42 vencimentos próximos</li>
          </ul>
        </DashboardPanel>
      </div>

      {/* =======================
          PAINEL DE MENSAGENS
      ======================= */}
      <div className="dashboard-messages-block">
        <div className="messages-card">
          <div className="messages-header">
            <h3>Mensagens — Esta Semana</h3>

            <div className="messages-status online">
              <span className="dot" />
              Online
            </div>
          </div>

          {/* GRÁFICO */}
          <div style={{ width: "100%", height: 280, marginBottom: 30, marginTop: 40 }}>
            <ResponsiveContainer>
              <LineChart data={messagesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#64748b"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* RESUMO */}
          <div className="messages-metrics">
            <div className="messages-metric success">
              <strong>827</strong>
              <span>Enviadas</span>
            </div>

            <div className="messages-metric">
              <strong>767</strong>
              <span>Recebidas</span>
            </div>

            <div className="messages-metric">
              <strong>492</strong>
              <span>Lidas</span>
            </div>

            <div className="messages-metric warning">
              <strong>10</strong>
              <span>Bloqueadas</span>
            </div>

            <div className="messages-metric danger">
              <strong>5</strong>
              <span>Erros</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
