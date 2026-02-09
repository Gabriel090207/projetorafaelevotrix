import {
  FaChartPie,
  FaUsers,
  FaMoneyBillWave,
  FaNetworkWired,
  FaFileAlt,
  FaComments,
  FaTools,
  FaCog,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";
import "../styles/layout.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-logo">EVX</h2>

      <nav className="sidebar-menu">
        <NavLink to="/dashboard">
          <FaChartPie />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/clientes">
          <FaUsers />
          <span>Clientes</span>
        </NavLink>

        <NavLink to="/financeiro">
          <FaMoneyBillWave />
          <span>Financeiro</span>
        </NavLink>

        <NavLink to="/rede">
          <FaNetworkWired />
          <span>Rede</span>
        </NavLink>

        <NavLink to="/mensagens">
          <FaComments />
          <span>Mensagens</span>
        </NavLink>

        <NavLink to="/ordens-servico">
          <FaTools />
          <span>Ordens de Serviço</span>
        </NavLink>

        <NavLink to="/relatorios">
          <FaFileAlt />
          <span>Relatórios</span>
        </NavLink>

        <NavLink to="/configuracoes">
          <FaCog />
          <span>Configurações</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
