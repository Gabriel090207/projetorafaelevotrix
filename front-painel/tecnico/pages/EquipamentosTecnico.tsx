import { useEffect, useState } from "react";
import api from "../../src/services/api";

import "../styles/equipamentos.css";

import { FiSearch } from "react-icons/fi";
import { FaWifi } from "react-icons/fa";

interface Equipamento {
  id: string;
  cliente_nome: string;
  mac: string;
  modelo: string;
  status: string;
}

const EquipamentosTecnico = () => {

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);

  async function carregarEquipamentos() {

    try {

      const response = await api.get("/equipamentos");

      setEquipamentos(response.data);

    } catch (error) {

      console.error("Erro ao carregar equipamentos");

    }

  }

  useEffect(() => {

    carregarEquipamentos();

  }, []);

  return (

    <div className="equipamentos-page">

      {/* HEADER */}

      <div className="equipamentos-header">

        <h1>Equipamentos</h1>

      </div>

      {/* KPIs */}

      <div className="equipamentos-kpis">

        <div className="kpi-card primary">
          <span>Total</span>
          <strong>{equipamentos.length}</strong>
        </div>

        <div className="kpi-card success">
          <span>Online</span>
          <strong>
            {equipamentos.filter(e => e.status === "online").length}
          </strong>
        </div>

        <div className="kpi-card warning">
          <span>Offline</span>
          <strong>
            {equipamentos.filter(e => e.status !== "online").length}
          </strong>
        </div>

      </div>

      {/* FILTROS */}

      <div className="equipamentos-filters">

        <div className="search-input">

          <FiSearch />

          <input placeholder="Buscar equipamento ou MAC" />

        </div>

      </div>

      {/* TABELA */}

      <div className="equipamentos-table-wrapper">

        <table className="equipamentos-table">

          <thead>

            <tr>
              <th>Cliente</th>
              <th>MAC</th>
              <th>Modelo</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>

          </thead>

          <tbody>

            {equipamentos.map((equip) => (

              <tr key={equip.id}>

                <td>{equip.cliente_nome}</td>

                <td>{equip.mac}</td>

                <td>{equip.modelo}</td>

                <td>

                  <span className={`status ${equip.status === "online" ? "success" : "open"}`}>

                    {equip.status === "online" ? "Online" : "Offline"}

                  </span>

                </td>

                <td className="actions">

                  <FaWifi />

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

};

export default EquipamentosTecnico;