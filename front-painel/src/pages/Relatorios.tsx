import "../styles/relatorios.css";
import {
  FaFileAlt,
  FaUser,
  FaMoneyBillWave,
  FaNetworkWired,
  FaSearch,
} from "react-icons/fa";

const Relatorios = () => {
  return (
    <div className="relatorios-page">
      {/* HEADER */}
      <div className="relatorios-header">
        <h1>Relatórios</h1>
      </div>

      {/* TIPOS DE RELATÓRIOS */}
      <div className="relatorios-cards">
        <div className="relatorio-card active">
          <FaUser />
          <span>Clientes</span>
        </div>

        <div className="relatorio-card">
          <FaMoneyBillWave />
          <span>Financeiro</span>
        </div>

        <div className="relatorio-card">
          <FaNetworkWired />
          <span>Conexão</span>
        </div>

        <div className="relatorio-card">
          <FaFileAlt />
          <span>Ordens de Serviço</span>
        </div>
      </div>

      {/* FILTROS */}
      <div className="relatorios-filters">
        <div className="filter-group">
          <label>Período</label>
          <select>
            <option>Hoje</option>
            <option>Últimos 7 dias</option>
            <option>Últimos 30 dias</option>
            <option>Personalizado</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select>
            <option>Todos</option>
            <option>Ativo</option>
            <option>Inativo</option>
          </select>
        </div>

        <div className="filter-group search">
          <label>Buscar</label>
          <div className="search-input">
            <FaSearch />
            <input placeholder="Nome, CPF ou código" />
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="relatorios-table-wrapper">
        <table className="relatorios-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>João da Silva</td>
              <td>Cliente</td>
              <td>
                <span className="status active">Ativo</span>
              </td>
              <td>05/02/2026</td>
              <td className="actions">📄 ⬇️</td>
            </tr>

            <tr>
              <td>Maria Oliveira</td>
              <td>Cliente</td>
              <td>
                <span className="status inactive">Inativo</span>
              </td>
              <td>01/02/2026</td>
              <td className="actions">📄 ⬇️</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Relatorios;
