import "../styles/chat.css";

import { FiSearch, FiSend } from "react-icons/fi";
import { FaRobot } from "react-icons/fa";

const ChatTecnico = () => {

  return (

    <div className="chat-container">

      {/* LISTA DE CONVERSAS */}

      <aside className="chat-list">

        <div className="chat-list-header">

          <h2>Chat Técnico</h2>

          <div className="chat-search">

            <FiSearch />

            <input placeholder="Pesquisar conversa" />

          </div>

        </div>

        <div className="chat-items">

          <div className="chat-item active">

            <strong>Central</strong>

            <span>Verifique a instalação do cliente</span>

          </div>

          <div className="chat-item">

            <strong>Suporte NOC</strong>

            <span>Cliente offline desde ontem</span>

          </div>

        </div>

      </aside>

      {/* JANELA DE CHAT */}

      <section className="chat-window">

        <div className="chat-header">

          <div>

            <strong>Central</strong>

          </div>

          <FaRobot className="bot-icon" title="Assistente ativo" />

        </div>

        <div className="chat-messages">

          <div className="message bot">

            <span>Olá técnico! Verifique o cliente João da Silva.</span>

          </div>

          <div className="message user">

            <span>Estou indo até o local agora.</span>

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

export default ChatTecnico;