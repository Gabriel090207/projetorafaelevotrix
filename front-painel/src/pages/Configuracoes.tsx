import "../styles/config.css";
import {
  FaUserCog,
  FaPlug,
  FaMoneyCheckAlt,
  FaShieldAlt,
} from "react-icons/fa";

const Configuracoes = () => {
  return (
    <div className="config-page">
      <div className="config-header">
        <h1>Configurações</h1>
      </div>

      <div className="config-cards">
        <div className="config-card">
          <FaUserCog />
          <span>Usuários</span>
        </div>

        <div className="config-card">
          <FaPlug />
          <span>Integrações</span>
        </div>

        <div className="config-card">
          <FaMoneyCheckAlt />
          <span>Gateways de Pagamento</span>
        </div>

        <div className="config-card">
          <FaShieldAlt />
          <span>Segurança</span>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
