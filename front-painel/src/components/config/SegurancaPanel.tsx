import { FaShieldAlt, FaUserLock, FaHistory } from "react-icons/fa";
import "../../styles/seguranca.css";

const SegurancaPanel = () => {
  return (
    <div className="seguranca-panel">
      
      <div className="panel-header">
        <h2>Segurança</h2>
        <p>Gerencie autenticação, permissões e logs do sistema.</p>
      </div>

      {/* CARDS PRINCIPAIS */}
      <div className="seguranca-grid">
        
        <div className="seguranca-card">
          <div className="card-icon">
            <FaShieldAlt />
          </div>
          <div>
            <h3>Autenticação 2FA</h3>
            <p>Ativar autenticação em dois fatores para usuários.</p>
            <span className="status-badge warning">Em breve</span>
          </div>
        </div>

        <div className="seguranca-card">
          <div className="card-icon">
            <FaUserLock />
          </div>
          <div>
            <h3>Políticas de Acesso</h3>
            <p>Definir permissões por perfil de usuário.</p>
            <span className="status-badge warning">Em breve</span>
          </div>
        </div>

        <div className="seguranca-card">
          <div className="card-icon">
            <FaHistory />
          </div>
          <div>
            <h3>Logs do Sistema</h3>
            <p>Visualizar histórico de ações e acessos.</p>
            <span className="status-badge warning">Em breve</span>
          </div>
        </div>

      </div>

      {/* BLOCO INFERIOR */}
      <div className="seguranca-box">
        <h3>Configurações Gerais</h3>
        <div className="seguranca-item">
          <span>Bloquear IP após múltiplas tentativas de login</span>
          <span className="status-badge success">Ativo</span>
        </div>

        <div className="seguranca-item">
          <span>Tempo de expiração de sessão</span>
          <span>30 minutos</span>
        </div>
      </div>

    </div>
  );
};

export default SegurancaPanel;