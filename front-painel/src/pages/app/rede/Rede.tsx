import "../../../styles/rede.css";
import {
  FaServer,
  FaWifi,
  FaMicrochip,
} from "react-icons/fa";

const Rede = () => {
  return (
    <div className="rede-page">

      {/* HEADER */}
      <div className="rede-header">
        <h1>Rede</h1>
      </div>

      {/* CARDS */}
      <div className="rede-cards">
        <div className="rede-card primary">
          <FaWifi />
          <div>
            <strong>1.102</strong>
            <span>Clientes Online</span>
          </div>
        </div>

        <div className="rede-card danger">
          <FaWifi />
          <div>
            <strong>146</strong>
            <span>Offline</span>
          </div>
        </div>

        <div className="rede-card warning">
          <FaMicrochip />
          <div>
            <strong>34%</strong>
            <span>CPU Mikrotik</span>
          </div>
        </div>

        <div className="rede-card success">
          <FaServer />
          <div>
            <strong>4</strong>
            <span>OLTs Ativas</span>
          </div>
        </div>
      </div>

      {/* 🔥 TÍTULO FORA DO CARD */}
      <div className="rede-section-title">
        <h2>Dispositivos Monitorados</h2>
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
            <tr>
              <td>Mikrotik Principal</td>
              <td>Router</td>
              <td>
                <span className="rede-status online">
                  Online
                </span>
              </td>
              <td>34%</td>
              <td>62%</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Rede;