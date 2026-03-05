import { useEffect, useState } from "react";
import api from "../../../services/api";

import "../../../styles/logs.css";

import {
  FiSearch,

} from "react-icons/fi";

const EMPRESA_ID = localStorage.getItem("empresa_id") || "";

interface Log {
  id: string;
  cliente_nome: string;
  ip_publico: string;
  porta: number;
  inicio: string;
  fim: string;
}

let logsCache: Log[] | null = null;

const LogsNavegacao = () => {

  const [logs, setLogs] = useState<Log[]>([]);

  async function carregarLogs() {

    try {

      if (logsCache) {
        setLogs(logsCache);
        return;
      }

      const response = await api.get(`/logs/empresa/${EMPRESA_ID}`);

      logsCache = response.data;

      setLogs(response.data);

    } catch (error) {

      console.error("Erro ao carregar logs", error);

    }

  }

  useEffect(() => {

    carregarLogs();

  }, []);

  function formatarData(data: string) {

    const d = new Date(data);

    return d.toLocaleString("pt-BR");

  }

  return (

    <div className="logs-page">

      <div className="logs-header">

        <h1>Logs de Navegação</h1>

      </div>


      <div className="logs-filters">

        <div className="filter-group">

          <label>IP Público</label>

          <input placeholder="Buscar IP" />

        </div>

        <div className="filter-group">

          <label>Cliente</label>

          <input placeholder="Nome do cliente" />

        </div>

        <div className="filter-group search">

          <label>Buscar</label>

          <div className="search-input">

            <FiSearch />

            <input placeholder="IP, cliente ou porta" />

          </div>

        </div>

      </div>


      <div className="logs-table-wrapper">

        <table className="logs-table">

          <thead>

            <tr>

              <th>Cliente</th>
              <th>IP Público</th>
              <th>Porta</th>
              <th>Início</th>
              <th>Fim</th>

            </tr>

          </thead>

          <tbody>

            {logs.map((log) => (

              <tr key={log.id}>

                <td>{log.cliente_nome}</td>

                <td>{log.ip_publico}</td>

                <td>{log.porta}</td>

                <td>{formatarData(log.inicio)}</td>

                <td>{formatarData(log.fim)}</td>

              </tr>

            ))}

            {logs.length === 0 && (

              <tr>

                <td colSpan={5} style={{padding:"14px"}}>

                  Nenhum log encontrado.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  )

}

export default LogsNavegacao