import "../../../styles/rede.css";
import {
  FaNetworkWired,
  FaServer,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

const dispositivosMock = [
  {
    id: 1,
    nome: "Mikrotik Principal",
    tipo: "Router",
    status: "online",
    cpu: "34%",
    memoria: "62%",
  },
];

const Rede = () => {
  return (
    <div className="rede-page">

      {/* HEADER */}
      <div className="rede-header">
        <h1>Dispositivos Monitorados</h1>
      </div>

      {/* CARDS KPI */}
      <div className="rede-cards">
        <div className="rede-card primary">
          <FaNetworkWired />
          <div>
            <span>Total Dispositivos</span>
            <strong>{dispositivosMock.length}</strong>
          </div>
        </div>

        <div className="rede-card success">
          <FaCheckCircle />
          <div>
            <span>Online</span>
            <strong>
              {
                dispositivosMock.filter((d) => d.status === "online")
                  .length
              }
            </strong>
          </div>
        </div>

        <div className="rede-card danger">
          <FaExclamationTriangle />
          <div>
            <span>Offline</span>
            <strong>
              {
                dispositivosMock.filter((d) => d.status === "offline")
                  .length
              }
            </strong>
          </div>
        </div>

        <div className="rede-card warning">
          <FaServer />
          <div>
            <span>Alertas</span>
            <strong>0</strong>
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="rede-table-wrapper">
        <table className="rede-table">
          <thead>
            <tr>
              <th>NOME</th>
              <th>TIPO</th>
              <th>STATUS</th>
              <th>CPU</th>
              <th>MEMÓRIA</th>
            </tr>
          </thead>

          <tbody>
            {dispositivosMock.map((dispositivo) => (
              <tr key={dispositivo.id}>
                <td>{dispositivo.nome}</td>
                <td>{dispositivo.tipo}</td>

                <td>
                  <span
                    className={`rede-status ${
                      dispositivo.status === "online"
                        ? "online"
                        : "offline"
                    }`}
                  >
                    {dispositivo.status === "online"
                      ? "Online"
                      : "Offline"}
                  </span>
                </td>

                <td>{dispositivo.cpu}</td>
                <td>{dispositivo.memoria}</td>
              </tr>
            ))}

            {dispositivosMock.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 16, opacity: 0.7 }}>
                  Nenhum dispositivo encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Rede;