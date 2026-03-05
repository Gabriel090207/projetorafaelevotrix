import { useEffect, useState } from "react";
import api from "../../../services/api";

import "../../../styles/notas.css";

import {
  FaFileInvoice,
 
  FaPlus
} from "react-icons/fa";


import {

  FiSearch,

} from "react-icons/fi";

const EMPRESA_ID = localStorage.getItem("empresa_id") || "";

interface Nota {
  id: string;
  cliente_nome: string;
  valor: number;
  status: string;
  data_emissao: string;
}

let notasCache: Nota[] | null = null;

const NotasFiscais = () => {

  const [notas, setNotas] = useState<Nota[]>([]);

  async function carregarNotas() {

    try {

      if (notasCache) {
        setNotas(notasCache);
        return;
      }

      const response = await api.get(`/nf/empresa/${EMPRESA_ID}`);

      notasCache = response.data;

      setNotas(response.data);

    } catch (error) {
      console.error("Erro ao carregar notas", error);
    }

  }

  useEffect(() => {
    carregarNotas();
  }, []);

  function formatarValor(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(data: string) {
    const d = new Date(data);
    return d.toLocaleDateString("pt-BR");
  }

  return (

    <div className="notas-page">

      <div className="notas-header">

        <h1>Notas Fiscais</h1>

        <button className="btn-primary">

          <FaPlus />

          Emitir Nota

        </button>

      </div>


      <div className="notas-filters">

        <div className="filter-group">

          <label>Status</label>

          <select>

            <option>Todos</option>
            <option>Emitida</option>
            <option>Cancelada</option>

          </select>

        </div>

        <div className="filter-group search">

          <label>Buscar</label>

          <div className="search-input">

            <FiSearch />

            <input placeholder="Cliente ou número da nota" />

          </div>

        </div>

      </div>


      <div className="notas-table-wrapper">

        <table className="notas-table">

          <thead>

            <tr>

              <th>Cliente</th>
              <th>Data</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>

            </tr>

          </thead>

          <tbody>

            {notas.map((nota) => (

              <tr key={nota.id}>

                <td>{nota.cliente_nome}</td>

                <td>{formatarData(nota.data_emissao)}</td>

                <td>{formatarValor(nota.valor)}</td>

                <td>

                  <span
                    className={`status ${
                      nota.status === "emitida"
                        ? "paid"
                        : "cancelled"
                    }`}
                  >

                    {nota.status}

                  </span>

                </td>

                <td className="actions">

                  <FaFileInvoice />

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

};

export default NotasFiscais;