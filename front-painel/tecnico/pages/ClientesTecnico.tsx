import { useEffect, useState } from "react";
import api from "../../src/services/api";

import "../styles/clientes.css";

import { FiSearch } from "react-icons/fi";

interface Cliente {
  id: string;
  nome: string;
  endereco: string;
  plano: string;
  status: string;
}

const ClientesTecnico = () => {

  const [clientes, setClientes] = useState<Cliente[]>([]);

  async function carregarClientes() {

    try {

      const response = await api.get("/clientes");

      setClientes(response.data);

    } catch (error) {

      console.error("Erro ao carregar clientes");

    }

  }

  useEffect(() => {

    carregarClientes();

  }, []);

  return (

    <div className="clientes-page">

      <div className="clientes-header">

        <h1>Clientes</h1>

      </div>

      {/* KPIs */}

      <div className="clientes-kpis">

        <div className="kpi-card primary">
          <span>Total</span>
          <strong>{clientes.length}</strong>
        </div>

        <div className="kpi-card success">
          <span>Online</span>
          <strong>
            {clientes.filter(c => c.status === "online").length}
          </strong>
        </div>

        <div className="kpi-card warning">
          <span>Offline</span>
          <strong>
            {clientes.filter(c => c.status !== "online").length}
          </strong>
        </div>

      </div>

      {/* FILTROS */}

      <div className="clientes-filters">

        <div className="search-input">

          <FiSearch />

          <input placeholder="Buscar cliente" />

        </div>

      </div>

      {/* TABELA */}

      <div className="clientes-table-wrapper">

        <table className="clientes-table">

          <thead>

            <tr>
              <th>Cliente</th>
              <th>Endereço</th>
              <th>Plano</th>
              <th>Status</th>
            </tr>

          </thead>

          <tbody>

            {clientes.map((cliente) => (

              <tr key={cliente.id}>

                <td>{cliente.nome}</td>

                <td>{cliente.endereco}</td>

                <td>{cliente.plano}</td>

                <td>

                  <span className={`status ${cliente.status === "online" ? "success" : "open"}`}>
                    {cliente.status === "online" ? "Online" : "Offline"}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

};

export default ClientesTecnico;