import "../../../styles/regua-cobranca.css";
import { FaRegClock, FaBell, FaBan } from "react-icons/fa";

const ReguaCobranca = () => {
  return (
    <div className="regua-page">
      {/* HEADER */}
      <div className="regua-header">
        <h1>Régua de Cobrança</h1>

        <button className="btn-primary">
          + Nova Regra
        </button>
      </div>

      {/* CARDS */}
      <div className="regua-kpis">
        <div className="regua-card primary">
          <FaRegClock />
          <div>
            <span>Lembrete</span>
            <strong>D-2</strong>
          </div>
        </div>

        <div className="regua-card warning">
          <FaBell />
          <div>
            <span>Aviso atraso</span>
            <strong>D+3</strong>
          </div>
        </div>

        <div className="regua-card danger">
          <FaBan />
          <div>
            <span>Bloqueio</span>
            <strong>D+10</strong>
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="regua-table-wrapper">
        <table className="regua-table">
          <thead>
            <tr>
              <th>Etapa</th>
              <th>Quando</th>
              <th>Canal</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan={4} style={{ padding: "16px 14px", opacity: 0.7 }}>
                Nenhuma regra cadastrada.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReguaCobranca;