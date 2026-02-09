import "../styles/clientes.css";
import {
  FiSearch,
  FiUserPlus,
  FiLock,
  FiMoreHorizontal,
} from "react-icons/fi";

const Clientes = () => {
  return (
    <div className="clientes-page">
      {/* HEADER */}
      <div className="clientes-header">
        <h1>Clientes</h1>

        <button className="btn-primary">
          <FiUserPlus />
          Novo Cliente
        </button>
      </div>

      {/* FILTROS */}
      <div className="clientes-filters">
        <div className="filter-group">
          <label>Central</label>
          <select>
            <option>Todas</option>
            <option>Central 1</option>
            <option>Central 2</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select>
            <option>Todos</option>
            <option>Online</option>
            <option>Offline</option>
            <option>Bloqueado</option>
          </select>
        </div>

        <div className="filter-group search">
          <label>Buscar</label>
          <div className="search-input">
            <FiSearch />
            <input placeholder="Nome, e-mail ou telefone" />
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="clientes-table-wrapper">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Celular</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>João da Silva</td>
              <td>joao@email.com</td>
              <td>(38) 9 9999-9999</td>
              <td>
                <span className="status offline">Offline</span>
              </td>
              <td className="actions">
                <FiLock />
                <FiMoreHorizontal />
              </td>
            </tr>

            <tr>
              <td>Maria Oliveira</td>
              <td>maria@email.com</td>
              <td>(38) 9 8888-8888</td>
              <td>
                <span className="status online">Online</span>
              </td>
              <td className="actions">
                <FiLock />
                <FiMoreHorizontal />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clientes;
