import { useEffect, useState } from "react";
import "../../styles/gateways.css";
import {
  FaUniversity,
  FaMoneyBillWave,
  FaCreditCard,
  FaBars,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

type Gateway = {
  id: string;
  nome: string;
  descricao: string;
  icon: React.ReactNode;
};

type GatewaySalvo = {
  id: string;
  tipo: string;
  nome: string;
  ativo: boolean;
};

const gatewaysDisponiveis: Gateway[] = [
  {
    id: "banco_brasil",
    nome: "Banco do Brasil",
    descricao: "PIX e Boleto",
    icon: <FaUniversity />,
  },
  {
    id: "efi_bank",
    nome: "Efí Bank",
    descricao: "PIX e Boleto",
    icon: <FaMoneyBillWave />,
  },
  {
    id: "sicoob",
    nome: "Sicoob",
    descricao: "PIX e Boleto",
    icon: <FaUniversity />,
  },
  {
    id: "sicredi",
    nome: "Sicredi",
    descricao: "PIX e Boleto",
    icon: <FaUniversity />,
  },
  {
    id: "lytex",
    nome: "Lytex Pagamentos",
    descricao: "Gateway PIX/Boleto",
    icon: <FaCreditCard />,
  },
];

const GatewaysPanel = () => {
  const [selecionado, setSelecionado] = useState<Gateway | null>(null);
  const [gateways, setGateways] = useState<GatewaySalvo[]>([]);

  const [nomeGateway, setNomeGateway] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    carregarGateways();
  }, []);

 async function carregarGateways() {
  try {
    const empresaId = localStorage.getItem("empresa_id");
    const token = localStorage.getItem("token");

    const response = await fetch(
  `${import.meta.env.VITE_API_URL}/gateways/${empresaId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      setGateways([]); // 🔥 Garante que sempre será array
      return;
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      setGateways(data);
    } else {
      setGateways([]); // 🔥 Se backend retornar objeto, força array vazio
    }
  } catch (err) {
    console.error("Erro ao carregar gateways", err);
    setGateways([]); // 🔥 Nunca deixa quebrar
  }
}

  async function salvarGateway() {
    try {
      const empresaId = localStorage.getItem("empresa_id");
      const token = localStorage.getItem("token");

      const payload = {
        empresa_id: empresaId,
        tipo: selecionado?.id,
        nome: nomeGateway,
        config: {
          client_id: clientId,
          client_secret: clientSecret,
          webhook_url: webhookUrl,
        },
        ativo: true,
      };

     const response = await fetch(`${import.meta.env.VITE_API_URL}/gateways/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error();

      alert("Gateway salvo com sucesso!");

      setSelecionado(null);
      setNomeGateway("");
      setClientId("");
      setClientSecret("");
      setWebhookUrl("");

      carregarGateways();
    } catch {
      alert("Erro ao salvar gateway");
    }
  }

  return (
    <div className="gateways-panel">
      <div className="panel-header">
        <h2>Gateways de Pagamento</h2>
        <p>
          Configure os gateways para emissão de boletos, carnês e pagamentos via PIX.
        </p>
      </div>

      {/* GRID DISPONÍVEIS */}
      <div className="gateways-grid">
        {gatewaysDisponiveis.map((gateway) => (
          <button
            key={gateway.id}
            type="button"
            className="gateway-card"
            onClick={() => setSelecionado(gateway)}
          >
            <div className="gateway-icon">{gateway.icon}</div>
            <div className="gateway-text">
              <h3>{gateway.nome}</h3>
              <p>{gateway.descricao}</p>
            </div>
          </button>
        ))}
      </div>

      {/* LISTA CONFIGURADOS */}
      <div className="gateways-lista">
        <table className="gateways-table">
          <thead>
            <tr>
              <th>Gateway</th>
              <th>Nome</th>
              <th>Status</th>
              <th>Opções</th>
            </tr>
          </thead>
          <tbody>
            {gateways.map((item) => (
              <tr key={item.id}>
                <td>{item.tipo.toUpperCase()}</td>
                <td>{item.nome}</td>
                <td>
                  <span
                    className={`status-badge ${
                      item.ativo ? "conectado" : "erro"
                    }`}
                  >
                    {item.ativo ? "ATIVO" : "INATIVO"}
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

            {gateways.length === 0 && (
  <tr>
    <td
      colSpan={4}
      style={{
        padding: "16px 28px",
        opacity: 0.7,
        fontSize: "14px",
        textAlign: "left",
      }}
    >
      Nenhum gateway configurado.
    </td>
  </tr>
)}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selecionado && (
        <div className="integracao-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Configurar {selecionado.nome}</h3>
              <button onClick={() => setSelecionado(null)}>✕</button>
            </div>

            <div className="modal-form">
              <label>Nome do gateway</label>
              <input
                value={nomeGateway}
                onChange={(e) => setNomeGateway(e.target.value)}
              />

              <label>Client ID</label>
              <input
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              />

              <label>Client Secret</label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
              />

              <label>Webhook URL</label>
              <input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setSelecionado(null)}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={salvarGateway}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GatewaysPanel;