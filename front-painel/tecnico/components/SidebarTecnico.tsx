import { NavLink } from "react-router-dom";
import "../styles/layout.css";

import {
  FaChartPie,
  FaClipboardList,
  FaMapMarkedAlt,
  FaUsers,
  FaWifi,
  FaComments,
  FaUser
} from "react-icons/fa";

const SidebarTecnico = () => {
  return (
    <aside className="tecnico-sidebar">
      <h2 className="tecnico-sidebar-logo">EVX</h2>

      <nav className="tecnico-sidebar-menu">
        <NavLink to="/tecnico/dashboard" className="tecnico-sidebar-link">
          <FaChartPie />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/tecnico/ordens" className="tecnico-sidebar-link">
          <FaClipboardList />
          <span>Ordens</span>
        </NavLink>

        <NavLink to="/tecnico/mapa" className="tecnico-sidebar-link">
          <FaMapMarkedAlt />
          <span>Mapa</span>
        </NavLink>

        <NavLink to="/tecnico/clientes" className="tecnico-sidebar-link">
          <FaUsers />
          <span>Clientes</span>
        </NavLink>

        <NavLink to="/tecnico/equipamentos" className="tecnico-sidebar-link">
          <FaWifi />
          <span>Equipamentos</span>
        </NavLink>

        <NavLink to="/tecnico/chat" className="tecnico-sidebar-link">
          <FaComments />
          <span>Chat</span>
        </NavLink>

        <NavLink to="/tecnico/perfil" className="tecnico-sidebar-link">
          <FaUser />
          <span>Meu Perfil</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default SidebarTecnico;