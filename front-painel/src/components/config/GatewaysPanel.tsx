import "../../styles/gateways.css";
import {
  FaUniversity,
  FaMoneyBillWave,
  FaCreditCard,
} from "react-icons/fa";

type Gateway = {
  id: string;
  nome: string;
  descricao: string;
  icon: React.ReactNode;
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
  return (
    <div className="gateways-panel">
      <div className="panel-header">
        <h2>Gateways de Pagamento</h2>
        <p>
          Configure os gateways para emissão de boletos, carnês e pagamentos via PIX.
        </p>
      </div>

      <div className="gateways-grid">
        {gatewaysDisponiveis.map((gateway) => (
          <button
            key={gateway.id}
            type="button"
            className="gateway-card"
          >
            <div className="gateway-icon">{gateway.icon}</div>
            <div className="gateway-text">
              <h3>{gateway.nome}</h3>
              <p>{gateway.descricao}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GatewaysPanel;