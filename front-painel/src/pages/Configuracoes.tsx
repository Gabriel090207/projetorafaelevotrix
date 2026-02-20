import { useState } from "react";
import "../styles/config.css";

import { FaUserCog, FaPlug, FaMoneyCheckAlt, FaShieldAlt } from "react-icons/fa";

// Componentes (vamos criar já já)
import IntegracoesPanel from "../components/config/IntegracoesPanel";
import GatewaysPanel from "../components/config/GatewaysPanel";
import UsuariosPanel from "../components/config/UsuariosPanel";
import SegurancaPanel from "../components/config/SegurancaPanel";

type AbaConfig = "usuarios" | "integracoes" | "gateways" | "seguranca";

const Configuracoes = () => {
  const [aba, setAba] = useState<AbaConfig>("usuarios");


  return (
    <div className="config-page">
      <div className="config-header">
        <h1>Configurações</h1>
      </div>

      <div className="config-cards">
        <button
          type="button"
          className={`config-card ${aba === "usuarios" ? "active" : ""}`}
          onClick={() => setAba("usuarios")}
        >
          <FaUserCog />
          <span>Usuários</span>
        </button>

        <button
          type="button"
          className={`config-card ${aba === "integracoes" ? "active" : ""}`}
          onClick={() => setAba("integracoes")}
        >
          <FaPlug />
          <span>Integrações</span>
        </button>

        <button
          type="button"
          className={`config-card ${aba === "gateways" ? "active" : ""}`}
          onClick={() => setAba("gateways")}
        >
          <FaMoneyCheckAlt />
          <span>Gateways de Pagamento</span>
        </button>

        <button
          type="button"
          className={`config-card ${aba === "seguranca" ? "active" : ""}`}
          onClick={() => setAba("seguranca")}
        >
          <FaShieldAlt />
          <span>Segurança</span>
        </button>
      </div>

      {/* CONTEÚDO ABAIXO (mesmo visual do resto do sistema) */}
      <div className="config-content">
        {aba === "usuarios" && <UsuariosPanel />}
        {aba === "integracoes" && <IntegracoesPanel />}
        {aba === "gateways" && <GatewaysPanel />}
        {aba === "seguranca" && <SegurancaPanel />}
      </div>
    </div>
  );
};

export default Configuracoes;
