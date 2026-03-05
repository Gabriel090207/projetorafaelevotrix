import { useEffect, useState } from "react";
import api from "../../../services/api";

import "../../../styles/equipamentos.css";

import {
  FiPlus,
  FiServer,
  FiCpu,
  FiWifi,
  FiSearch
} from "react-icons/fi";

interface Equipamento {
  id: string;
  nome: string;
  tipo: string;
  ip: string;
  status: string;
}

const Equipamentos = () => {

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [busca, setBusca] = useState("");

  async function carregarEquipamentos() {

    try {

      const response = await api.get("/equipamentos");

      setEquipamentos(response.data);

    } catch (error) {

      console.error("Erro ao carregar equipamentos", error);

    }

  }

  useEffect(() => {

    carregarEquipamentos();

  }, []);

  const equipamentosFiltrados = equipamentos.filter((eq) =>
    eq.nome.toLowerCase().includes(busca.toLowerCase()) ||
    eq.ip.includes(busca)
  );

  return (

    <div className="equipamentos-page">

      <div className="equipamentos-header">

        <h1>Equipamentos</h1>

        <button className="btn-primary">
          <FiPlus />
          Novo Equipamento
        </button>

      </div>

      <div className="equipamentos-filters">

        <div className="filter-group search">

          <label>Buscar</label>

          <div className="search-input">

            <FiSearch />

            <input
              placeholder="Nome ou IP"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

          </div>

        </div>

      </div>

      <div className="equipamentos-table-wrapper">

        <table className="equipamentos-table">

          <thead>

            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>IP</th>
              <th>Status</th>
            </tr>

          </thead>

          <tbody>

            {equipamentosFiltrados.map((eq) => (

              <tr key={eq.id}>

                <td>{eq.nome}</td>

                <td className="tipo">

                  {eq.tipo === "mikrotik" && <FiCpu />}
                  {eq.tipo === "olt" && <FiServer />}
                  {eq.tipo === "onu" && <FiWifi />}

                  {eq.tipo}

                </td>

                <td>{eq.ip}</td>

                <td>
                  <span className={`status ${eq.status}`}>
                    {eq.status}
                  </span>
                </td>

              </tr>

            ))}

            {equipamentosFiltrados.length === 0 && (

              <tr>

                <td colSpan={4} style={{ padding: 14 }}>
                  Nenhum equipamento encontrado.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

};

export default Equipamentos;