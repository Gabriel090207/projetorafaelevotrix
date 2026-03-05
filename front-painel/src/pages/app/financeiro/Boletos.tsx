import "../../../styles/boletos.css";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

const Boletos = () => {
  return (
    <div className="boletos-page">
      {/* HEADER */}
      <div className="boletos-header">
        <h1>Boletos & Pix</h1>

        <button className="btn-primary">
          <FaFileInvoiceDollar />
          Gerar cobrança
        </button>
      </div>

      {/* FILTROS */}
      <div className="boletos-filters">
        <div className="filter-group">
          <label>Status</label>
          <select>
            <option>Todos</option>
            <option>Pago</option>
            <option>Em aberto</option>
            <option>Cancelado</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Tipo</label>
          <select>
            <option>Todos</option>
            <option>Boleto</option>
            <option>Pix</option>
          </select>
        </div>

        <div className="filter-group search">
          <label>Buscar</label>
          <div className="search-input">
            <FiSearch />
            <input placeholder="Cliente, CPF ou referência" />
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="boletos-table-wrapper">
        <table className="boletos-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan={6} style={{ padding: "16px 14px", opacity: 0.7 }}>
                Nenhum boleto/pix encontrado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Boletos;