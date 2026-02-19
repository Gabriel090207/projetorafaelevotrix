import "../styles/rede.css";
import {
 
  FaServer,
  FaWifi,
  FaMicrochip,
} from "react-icons/fa";

const Rede = () => {
  return (
    <div className="rede-page">
      <div className="rede-header">
        <h1>Rede</h1>
      </div>

      {/* CARDS DE STATUS */}
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

      {/* TABELA FUTURA DE DISPOSITIVOS */}
      <div className="rede-table-wrapper">
        <h3>Dispositivos Monitorados</h3>
        <table className="rede-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>CPU</th>
              <th>Memória</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mikrotik Principal</td>
              <td>Router</td>
              <td>Online</td>
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
