import "../../../styles/comodato.css";
import { FaPlus, FaSearch } from "react-icons/fa";

interface Equipamento {
  id: string;
  modelo: string;
  mac: string;
  serial: string;
  cliente?: string;
  status: "disponivel" | "instalado" | "manutencao";
}

const Comodato = () => {

  const equipamentos: Equipamento[] = [];

  return (
    <div className="comodato-page">

      {/* HEADER */}
      <div className="comodato-header">
        <h1>Comodato</h1>

        <button className="btn-primary">
          <FaPlus />
          Novo Equipamento
        </button>
      </div>

      {/* FILTROS */}
      <div className="comodato-filters">
        <div className="filter-group">
          <label>Status</label>
          <select>
            <option>Todos</option>
            <option>Disponível</option>
            <option>Instalado</option>
            <option>Manutenção</option>
          </select>
        </div>

        <div className="filter-group search">
          <label>Buscar</label>
          <div className="search-input">
            <FaSearch />
            <input placeholder="MAC, serial ou cliente" />
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="comodato-table-wrapper">
        <table className="comodato-table">
          <thead>
            <tr>
              <th>Modelo</th>
              <th>MAC</th>
              <th>Serial</th>
              <th>Cliente</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {equipamentos.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-row">
                  Nenhum equipamento cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Comodato;