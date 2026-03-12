import { useEffect, useState } from "react";
import api from "../../src/services/api";

import "../styles/mapa.css";

import { FiSearch } from "react-icons/fi";

interface ClienteMapa {
  id: string;
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
}

const MapaTecnico = () => {

  const [clientes, setClientes] = useState<ClienteMapa[]>([]);

  async function carregarClientes() {

    try {

      const response = await api.get("/clientes");

      setClientes(response.data);

    } catch (error) {

      console.error("Erro ao carregar clientes", error);

    }

  }

  useEffect(() => {

    carregarClientes();

  }, []);

  return (

    <div className="mapa-page">

      <div className="mapa-header">

        <h1>Mapa de Atendimento</h1>

      </div>

      {/* KPIs */}

      <div className="mapa-kpis">

        <div className="kpi-card primary">
          <span>Total Clientes</span>
          <strong>{clientes.length}</strong>
        </div>

        <div className="kpi-card success">
          <span>Com localização</span>
          <strong>
            {clientes.filter(c => c.latitude && c.longitude).length}
          </strong>
        </div>

      </div>

      {/* FILTROS */}

      <div className="mapa-filters">

        <div className="search-input">

          <FiSearch />

          <input placeholder="Buscar cliente no mapa" />

        </div>

      </div>

      {/* MAPA */}

      <div className="mapa-container">

        <div className="mapa-placeholder">

          Mapa aparecerá aqui

        </div>

      </div>

    </div>

  );

};

export default MapaTecnico;