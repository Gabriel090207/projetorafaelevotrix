import { useEffect, useState } from "react";
import "../styles/ordens.css";
import api from "../../src/services/api";

import { FaClipboardList } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

interface OrdemServico {
  id: string;
  cliente_nome: string;
  status: string;
  data_abertura: string;
}

const OrdensTecnico = () => {

  const [ordens, setOrdens] = useState<OrdemServico[]>([]);

  async function carregarOrdens() {
    try {

      const tecnico_id = localStorage.getItem("tecnico_id");

      const response = await api.get(
        `/ordens-servico/tecnico/${tecnico_id}`
      );

      setOrdens(response.data);

    } catch (error) {
      console.error("Erro ao carregar ordens", error);
    }
  }

  useEffect(() => {
    carregarOrdens();
  }, []);

  function formatarData(data: string) {

    const d = new Date(data);
    return d.toLocaleDateString("pt-BR");

  }

  return (

    <div className="os-page">

      <div className="os-header">

        <h1>Minhas Ordens</h1>

      </div>

      {/* KPIs */}

      <div className="os-kpis">

        <div className="kpi-card primary">
          <span>Total</span>
          <strong>{ordens.length}</strong>
        </div>

        <div className="kpi-card warning">
          <span>Em andamento</span>
          <strong>
            {ordens.filter(o => o.status === "andamento").length}
          </strong>
        </div>

        <div className="kpi-card success">
          <span>Concluídas</span>
          <strong>
            {ordens.filter(o => o.status === "concluida").length}
          </strong>
        </div>

      </div>

      {/* FILTRO */}

      <div className="os-filters">

        <div className="filter-group search">

          <label>Buscar</label>

          <div className="search-input">

            <FiSearch />

            <input placeholder="Buscar cliente ou OS" />

          </div>

        </div>

      </div>

      {/* TABELA */}

      <div className="os-table-wrapper">

        <table className="os-table">

          <thead>
            <tr>
              <th>Cliente</th>
              <th>Abertura</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>

            {ordens.map((os) => (

              <tr key={os.id}>

                <td>{os.cliente_nome}</td>

                <td>{formatarData(os.data_abertura)}</td>

                <td>

                  <span
                    className={`status ${
                      os.status === "concluida"
                        ? "success"
                        : os.status === "andamento"
                        ? "warning"
                        : "open"
                    }`}
                  >

                    {os.status === "concluida"
                      ? "Concluída"
                      : os.status === "andamento"
                      ? "Em andamento"
                      : "Aberta"}

                  </span>

                </td>

                <td className="actions">

                  <FaClipboardList />

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

};

export default OrdensTecnico;