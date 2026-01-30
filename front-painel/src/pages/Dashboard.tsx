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

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      {/* =======================
          CARDS SUPERIORES (KPIs)
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
          PAINÉIS INFERIORES
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

        <DashboardPanel
          title="Rede"
          icon={<FaNetworkWired />}
          variant="network"
        >
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
    BOT / WHATSAPP (BLOCO GRANDE)
======================= */}
<div className="dashboard-bot-block">
  {/* CARD SUPERIOR */}
  <div className="bot-block-card">
    <div className="bot-block-header">
      <h3>WhatsApp Bot — Resumo</h3>

      <div className="bot-status online">
        <span className="dot" />
        Online
      </div>
    </div>

    <div className="bot-block-content">
      <div className="bot-metrics">
        <div>
          <strong>379</strong>
          <span>Enviadas</span>
        </div>
        <div>
          <strong>339</strong>
          <span>Recebidas</span>
        </div>
        <div>
          <strong>254</strong>
          <span>Lidas</span>
        </div>
        <div>
          <strong>7</strong>
          <span>Erros</span>
        </div>
      </div>
    </div>
  </div>

  {/* CARD INFERIOR */}
  <div className="bot-block-card">
    <div className="bot-block-header">
      <h3>Detalhes do Bot</h3>
    </div>

    <ul className="bot-details">
      <li>Canal: WhatsApp</li>
      <li>Número conectado: +55 11 99999-9999</li>
      <li>Última sincronização: há 2 minutos</li>
      <li>Fila atual: 0 mensagens</li>
    </ul>
  </div>
</div>

     

    </div>
  );
};

export default Dashboard;
