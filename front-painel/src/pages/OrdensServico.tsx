import "../styles/os.css";
import {  FaPlus, FaSearch } from "react-icons/fa";

const OrdensServico = () => {
  return (
    <div className="os-page">
      <div className="os-header">
        <h1>Ordens de Serviço</h1>

        <button className="btn-primary">
          <FaPlus />
          Nova Ordem
        </button>
      </div>

      <div className="os-filters">
        <div className="filter-group">
          <label>Status</label>
          <select>
            <option>Todas</option>
            <option>Aberta</option>
            <option>Em andamento</option>
            <option>Concluída</option>
          </select>
        </div>

        <div className="filter-group search">
          <label>Buscar</label>
          <div className="search-input">
            <FaSearch />
            <input placeholder="Cliente ou protocolo" />
          </div>
        </div>
      </div>

      <div className="os-table-wrapper">
        <table className="os-table">
          <thead>
            <tr>
              <th>Protocolo</th>
              <th>Cliente</th>
              <th>Técnico</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SUP-00123</td>
              <td>Carlos Souza</td>
              <td>João Técnico</td>
              <td>Aberta</td>
              <td>19/02/2026</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdensServico;
