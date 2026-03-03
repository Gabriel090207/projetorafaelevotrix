import "../../../styles/chatbot.css";
import { FaPlug, FaSave } from "react-icons/fa";

const Chatbot = () => {
  return (
    <div className="chatbot-page">

      {/* HEADER */}
      <div className="chatbot-header">
        <h1>Chatbot</h1>
      </div>

      {/* STATUS CONEXÃO */}
      <div className="chatbot-status-card">
        <div>
          <span>Status da Integração</span>
          <strong className="status-offline">Desconectado</strong>
        </div>

        <button className="btn-primary">
          <FaPlug />
          Conectar WhatsApp
        </button>
      </div>

      {/* CONFIGURAÇÃO GERAL */}
      <div className="chatbot-config-card">
        <h3>Configuração Geral</h3>

        <div className="chatbot-form-grid">

          <div className="form-group">
            <label>Nome do Bot</label>
            <input type="text" placeholder="Ex: ProvedorX Bot" />
          </div>

          <div className="form-group">
            <label>Mensagem Inicial</label>
            <textarea placeholder="Digite a mensagem de boas-vindas..." />
          </div>

          <div className="form-group">
            <label>API Key</label>
            <input type="text" placeholder="Chave da API WhatsApp" />
          </div>

        </div>

        <button className="btn-primary save-btn">
          <FaSave />
          Salvar Configuração
        </button>
      </div>

    </div>
  );
};

export default Chatbot;