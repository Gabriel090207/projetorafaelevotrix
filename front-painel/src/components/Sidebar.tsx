import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../styles/layout.css";

import {
  FaChartPie,
  FaUsers,
  FaMoneyBillWave,
  FaNetworkWired,
  FaFileAlt,
  FaComments,
  FaTools,
  FaCog,
  FaRobot,
  FaClipboardList,
  FaBoxOpen,
  FaRoute,
  FaWifi,
} from "react-icons/fa";

import { FiChevronDown } from "react-icons/fi";

type GroupKey = "operacao" | "financeiro" | "rede" | "produtos" | "admin" | null;

type Group = {
  key: Exclude<GroupKey, null>;
  title: string;
  icon: React.ReactNode;
  items: Array<{
    to: string;
    label: string;
    icon: React.ReactNode;
  }>;
};

const Sidebar = () => {
  const location = useLocation();

  const groups: Group[] = useMemo(
    () => [
      {
        key: "operacao",
        title: "Operação",
        icon: <FaClipboardList />,
        items: [
          { to: "/clientes", label: "Clientes", icon: <FaUsers /> },
          { to: "/contratos", label: "Contratos", icon: <FaClipboardList /> },
          { to: "/ordens-servico", label: "Ordens", icon: <FaTools /> },
          { to: "/mensagens", label: "Atendimento", icon: <FaComments /> },
        ],
      },
      {
        key: "financeiro",
        title: "Financeiro",
        icon: <FaMoneyBillWave />,
        items: [
          { to: "/financeiro", label: "Cobranças", icon: <FaMoneyBillWave /> },
          { to: "/boletos", label: "Boletos & Pix", icon: <FaFileAlt /> },
          { to: "/regua-cobranca", label: "Régua", icon: <FaRoute /> },
          { to: "/relatorios", label: "Relatórios", icon: <FaFileAlt /> },
        ],
      },
      {
        key: "rede",
        title: "Rede (NOC)",
        icon: <FaNetworkWired />,
        items: [
          { to: "/rede", label: "Visão Geral", icon: <FaNetworkWired /> },
          { to: "/online", label: "Clientes Online", icon: <FaWifi /> },
          { to: "/ftth", label: "Mapa FTTH", icon: <FaRoute /> },
        ],
      },
      {
        key: "produtos",
        title: "Produtos",
        icon: <FaBoxOpen />,
        items: [
          { to: "/planos", label: "Planos", icon: <FaMoneyBillWave /> },
          { to: "/comodato", label: "Comodato", icon: <FaBoxOpen /> },
        ],
      },
      
    ],
    []
  );

  // abre automaticamente o grupo da rota atual
  const groupFromPath = useMemo((): GroupKey => {
    const path = location.pathname;
    for (const g of groups) {
      if (g.items.some((it) => path === it.to)) return g.key;
    }
    return null;
  }, [location.pathname, groups]);

  const [openGroup, setOpenGroup] = useState<GroupKey>(null);

  // carrega preferencia (se não existir, abre o grupo da rota atual)
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_open_group");
    if (saved) {
      setOpenGroup(saved as GroupKey);
      return;
    }
    setOpenGroup(groupFromPath);
  }, []);

  // mantém sincronizado com a rota (se navegar por link externo/redirect)
  useEffect(() => {
    if (groupFromPath) setOpenGroup(groupFromPath);
  }, [groupFromPath]);

  const toggleGroup = (key: Exclude<GroupKey, null>) => {
    setOpenGroup((prev) => {
      const next = prev === key ? null : key;
      localStorage.setItem("sidebar_open_group", String(next));
      return next;
    });
  };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-logo">EVX</h2>

      <nav className="sidebar-menu">
        {/* Dashboard */}
        <NavLink to="/dashboard" className="sidebar-link">
          <FaChartPie />
          <span>Dashboard</span>
        </NavLink>

        {/* Grupos (accordion: só 1 aberto por vez) */}
        {groups.map((g) => {
          const isOpen = openGroup === g.key;

          return (
            <div className="sidebar-group" key={g.key}>
              <button
                type="button"
                className={`sidebar-group-header ${isOpen ? "open" : ""}`}
                onClick={() => toggleGroup(g.key)}
                aria-expanded={isOpen}
              >
                <div className="sidebar-group-left">
                  <span className="sidebar-group-icon">{g.icon}</span>
                  <span className="sidebar-group-name">{g.title}</span>
                </div>

                <FiChevronDown className={`sidebar-group-chevron ${isOpen ? "open" : ""}`} />
              </button>

              <div className={`sidebar-group-items ${isOpen ? "open" : ""}`}>
                {g.items.map((it) => (
                  <NavLink key={it.to} to={it.to} className="sidebar-sublink">
                    <span className="sidebar-sublink-icon">{it.icon}</span>
                    <span>{it.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
        {/* Administração (item direto, sem submenu) */}
<NavLink to="/configuracoes" className="sidebar-link">
  <FaCog />
  <span>Administração</span>
</NavLink>

        {/* Chatbot (módulo solo, clean) */}
        <NavLink to="/chatbot" className="sidebar-link sidebar-highlight">
          <FaRobot />
          <span>Chatbot </span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;