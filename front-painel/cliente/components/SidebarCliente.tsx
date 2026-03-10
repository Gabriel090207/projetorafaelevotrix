import { NavLink } from "react-router-dom";
import "../../src/styles/layout.css";

import {
  FaChartPie,
  FaFileInvoiceDollar,
  FaWifi,
  FaComments,
  FaHeadset,
  FaUser,
} from "react-icons/fa";

const SidebarCliente = () => {
  return (
    <aside className="sidebar">

      <h2 className="sidebar-logo">EVX</h2>

      <nav className="sidebar-menu">

        <NavLink to="/cliente/dashboard" className="sidebar-link">
          <FaChartPie />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/cliente/faturas" className="sidebar-link">
          <FaFileInvoiceDollar />
          <span>Faturas</span>
        </NavLink>

        <NavLink to="/cliente/internet" className="sidebar-link">
          <FaWifi />
          <span>Internet</span>
        </NavLink>

        <NavLink to="/cliente/suporte" className="sidebar-link">
          
           <FaHeadset />
          <span>Suporte</span>
        </NavLink>

        <NavLink to="/cliente/atendimento" className="sidebar-link">
         <FaComments />
          <span>Atendimento</span>
        </NavLink>

        <NavLink to="/cliente/perfil" className="sidebar-link">
          <FaUser />
          <span>Meu Perfil</span>
        </NavLink>

      </nav>

    </aside>
  );
};

export default SidebarCliente;