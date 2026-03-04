import "../../../styles/chat.css";
import { FiSearch, FiSend } from "react-icons/fi";
import { FaRobot } from "react-icons/fa";

const Mensagens = () => {
  return (
    <div className="chat-container">
      {/* LISTA DE CONVERSAS */}
      <aside className="chat-list">
        <div className="chat-list-header">
          <h2>Atendimento</h2>
          <div className="chat-search">
            <FiSearch />
            <input placeholder="Pesquisar conversa" />
          </div>
        </div>

        <div className="chat-items">
          <div className="chat-item active">
            <strong>João da Silva</strong>
            <span>Última mensagem do cliente...</span>
          </div>

          <div className="chat-item">
            <strong>Maria Oliveira</strong>
            <span>Oi, gostaria de informações</span>
          </div>
        </div>
      </aside>

      {/* JANELA DE CHAT */}
      <section className="chat-window">
        <div className="chat-header">
          <div>
            <strong>João da Silva</strong>
           
          </div>

          <FaRobot className="bot-icon" title="Chatbot ativo" />

        </div>

        <div className="chat-messages">
          <div className="message bot">
            <span>Olá! Sou o assistente virtual 🤖</span>
          </div>

          <div className="message user">
            <span>Quero saber meu boleto</span>
          </div>

          <div className="message bot">
            <span>Claro! Vou te ajudar com isso.</span>
          </div>
        </div>

        <div className="chat-input">
          <input placeholder="Digite sua mensagem..." />
          <button>
            <FiSend />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Mensagens;
