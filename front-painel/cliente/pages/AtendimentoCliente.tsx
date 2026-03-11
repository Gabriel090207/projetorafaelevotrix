import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/atendimento.css";

interface Chamado {
  id: string;
  assunto: string;
  status: string;
  data: string;
}

const AtendimentoCliente = () => {

  const [chamados, setChamados] = useState<Chamado[]>([]);

  useEffect(() => {
    carregarChamados();
  }, []);

  async function carregarChamados() {
    try {
      const response = await api.get("/cliente/chamados");
      setChamados(response.data);
    } catch (error) {
      console.error("Erro ao carregar chamados", error);
    }
  }

  return (
    <div className="atendimento-page">

      <div className="atendimento-header">
        <h1>Atendimento</h1>

        <button
          className="btn-primary"
          onClick={() => alert("Abrir chamado em breve")}
        >
          Abrir chamado
        </button>
      </div>

      <div className="atendimento-table-wrapper">

        <table className="atendimento-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Assunto</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>

          <tbody>

            {chamados.map((c) => (
              <tr key={c.id}>

                <td>{c.id}</td>

                <td>{c.assunto}</td>

                <td>
                  <span className={`status ${c.status}`}>
                    {c.status}
                  </span>
                </td>

                <td>{c.data}</td>

              </tr>
            ))}

            {chamados.length === 0 && (
              <tr>
                <td colSpan={4}>Nenhum chamado encontrado.</td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default AtendimentoCliente;