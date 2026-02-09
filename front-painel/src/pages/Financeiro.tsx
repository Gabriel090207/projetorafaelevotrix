import "../styles/financeiro.css";
import { FaMoneyBillWave, FaFileInvoiceDollar, FaSearch } from "react-icons/fa";

const Financeiro = () => {
  return (
    <div className="financeiro-page">
      {/* HEADER */}
      <div className="financeiro-header">
        <h1>Financeiro</h1>

        <button className="btn-primary">
          <FaFileInvoiceDollar />
          Emitir cobrança
        </button>
      </div>

      {/* KPIs */}
      <div className="financeiro-kpis">
        <div className="kpi-card">
          <span>Faturamento do mês</span>
          <strong>R$ 124.000</strong>
        </div>

        <div className="kpi-card warning">
          <span>Em aberto</span>
          <strong>R$ 84.230</strong>
        </div>

        <div className="kpi-card danger">
          <span>Vencidos</span>
          <strong>R$ 18.900</strong>
        </div>
      </div>

      {/* FILTROS */}
      <div className="financeiro-filters">
        <div className="filter-group">
          <label>Status</label>
          <select>
            <option>Todos</option>
            <option>Pago</option>
            <option>Em aberto</option>
            <option>Vencido</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Forma</label>
          <select>
            <option>Todas</option>
            <option>Boleto</option>
            <option>PIX</option>
            <option>Cartão</option>
          </select>
        </div>

        <div className="filter-group search">
          <label>Buscar</label>
          <div className="search-input">
            <FaSearch />
            <input placeholder="Cliente, CPF ou fatura" />
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="financeiro-table-wrapper">
        <table className="financeiro-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Documento</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>João da Silva</td>
              <td>FAT-10231</td>
              <td>05/02/2026</td>
              <td>R$ 129,90</td>
              <td>
                <span className="status open">Em aberto</span>
              </td>
              <td className="actions">
                <FaMoneyBillWave />
              </td>
            </tr>

            <tr>
              <td>Maria Oliveira</td>
              <td>FAT-10218</td>
              <td>01/02/2026</td>
              <td>R$ 99,90</td>
              <td>
                <span className="status paid">Pago</span>
              </td>
              <td className="actions">
                <FaMoneyBillWave />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Financeiro;
