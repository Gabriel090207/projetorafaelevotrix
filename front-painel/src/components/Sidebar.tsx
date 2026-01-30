import {
  FaChartPie,
  FaUsers,
  FaMoneyBillWave,
  FaNetworkWired,
  FaFileAlt
} from "react-icons/fa";
import "../styles/layout.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-logo">EVX</h2>

      <nav className="sidebar-menu">
        <a className="active">
          <FaChartPie />
          <span>Dashboard</span>
        </a>

        <a>
          <FaUsers />
          <span>Clientes</span>
        </a>

        <a>
          <FaMoneyBillWave />
          <span>Financeiro</span>
        </a>

        <a>
          <FaNetworkWired />
          <span>Rede</span>
        </a>

        <a>
          <FaFileAlt />
          <span>Relatórios</span>
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
