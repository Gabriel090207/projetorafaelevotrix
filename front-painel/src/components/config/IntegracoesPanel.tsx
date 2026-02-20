import { useState } from "react";
import "../../styles/integracoes.css";

import {
  FaServer,
  FaUniversity,
  FaMoneyBillWave,
  FaFileInvoice,
  FaNetworkWired,
  FaRobot,
  FaBars,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

type Integracao = {
  id: string;
  nome: string;
  descricao: string;
  icon: React.ReactNode;
};

const integracoesDisponiveis: Integracao[] = [
  { id: "mk_auth", nome: "MK-AUTH", descricao: "Integração com MK-AUTH", icon: <FaServer /> },
  { id: "sgp", nome: "SGP", descricao: "Integração com SGP", icon: <FaServer /> },
  { id: "mikweb", nome: "MIKWEB", descricao: "Integração com MikWeb", icon: <FaServer /> },
  { id: "receitanet", nome: "ReceitaNet", descricao: "Chatbot/ReceitaNet", icon: <FaRobot /> },
  { id: "nfcom", nome: "NFCom", descricao: "Emissão de Nota Fiscal", icon: <FaFileInvoice /> },
  { id: "mikrotik_radius", nome: "MikroTik (Radius)", descricao: "PPPoE/DHCP/Hotspot", icon: <FaNetworkWired /> },
  { id: "banco_brasil", nome: "Banco do Brasil", descricao: "Boletos e PIX", icon: <FaUniversity /> },
  { id: "efi_bank", nome: "Efí Bank", descricao: "Gateway PIX/Boleto", icon: <FaMoneyBillWave /> },
];


type IntegracaoCriada = {
  id: string;
  sistema: string;
  nome: string;
  status: "conectado" | "erro" | "timeout";
};

const integracoesCriadas: IntegracaoCriada[] = [
  {
    id: "1",
    sistema: "MK-AUTH",
    nome: "MegaNet Tecnologia",
    status: "timeout",
  },
  {
    id: "2",
    sistema: "BANCO INTER",
    nome: "PIX - INTER",
    status: "erro",
  },
  {
    id: "3",
    sistema: "BANCO DO BRASIL",
    nome: "PIX BB",
    status: "conectado",
  },
  {
    id: "4",
    sistema: "EFI BANK",
    nome: "Pix_MegaNet Tecnologia",
    status: "conectado",
  },
  {
    id: "5",
    sistema: "SGP",
    nome: "SGP",
    status: "conectado",
  },
];

const IntegracoesPanel = () => {
  const [selecionada, setSelecionada] = useState<Integracao | null>(null);

  return (
    <div className="integracoes-panel">
      <div className="panel-header">
        <h2>Integrações</h2>
        <p>Configure as integrações do provedor (cliente do seu cliente).</p>
      </div>

      <div className="integracoes-grid">
        {integracoesDisponiveis.map((item) => (
          <button
            key={item.id}
            type="button"
            className="integracao-card"
            onClick={() => setSelecionada(item)}
          >
            <div className="integracao-icon">{item.icon}</div>
            <div className="integracao-text">
              <h3>{item.nome}</h3>
              <p>{item.descricao}</p>
            </div>
          </button>
        ))}
      </div>


      <div className="integracoes-lista">
  <table className="integracoes-table">
    <thead>
      <tr>
        <th>Sistema</th>
        <th>Nome</th>
        <th>Status</th>
        <th>Opções</th>
      </tr>
    </thead>
    <tbody>
      {integracoesCriadas.map((item) => (
        <tr key={item.id}>
          <td>{item.sistema}</td>
          <td>{item.nome}</td>
          <td>
            <span className={`status-badge ${item.status}`}>
              {item.status === "conectado" && "CONECTADO"}
              {item.status === "erro" && "ERRO DESCONHECIDO"}
              {item.status === "timeout" && "SERVIDOR TIMEOUT"}
            </span>
          </td>
          <td>
            <div className="acoes">
  <FaBars />
  <FaEdit />
  <FaTrash />
</div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      

      {selecionada && (
        <div className="integracao-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Configurar {selecionada.nome}</h3>
              <button className="modal-close" onClick={() => setSelecionada(null)}>
                ✕
              </button>
            </div>

            <div className="modal-form">
              <label>Nome (identificação)</label>
              <input placeholder="Ex: MegaNet Tecnologia" />

              <label>URL / Base URL</label>
              <input placeholder="https://seu-host/api" />

              <label>Usuário / App Key</label>
              <input placeholder="admin / app_key" />

              <label>Senha / Secret Key</label>
              <input placeholder="senha / secret" type="password" />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setSelecionada(null)}>
                Cancelar
              </button>
              <button className="btn-primary">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegracoesPanel;
