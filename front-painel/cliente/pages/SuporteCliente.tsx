import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/suporte.css";

interface Chamado {
  id: string;
  titulo: string;
  status: string;
  criado_em: string;
}

const SuporteCliente = () => {

  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

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

  async function abrirChamado() {

    if (!titulo || !descricao) {
      alert("Preencha título e descrição");
      return;
    }

    try {

      await api.post("/cliente/chamados", {
        titulo,
        descricao
      });

      setTitulo("");
      setDescricao("");

      carregarChamados();

    } catch (error) {
      console.error(error);
      alert("Erro ao abrir chamado");
    }
  }

  return (
    <div className="suporte-page">

      <div className="suporte-header">
        <h1>Suporte</h1>
      </div>

      {/* ABRIR CHAMADO */}

      <div className="suporte-card">

        <h2>Abrir chamado</h2>

        <input
          placeholder="Assunto do problema"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <textarea
          placeholder="Descreva o problema"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <button
          className="btn-primary"
          onClick={abrirChamado}
        >
          Enviar chamado
        </button>

      </div>


      {/* HISTÓRICO */}

      <div className="suporte-card">

        <h2>Meus chamados</h2>

        <table className="suporte-table">

          <thead>
            <tr>
              <th>Assunto</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>

          <tbody>

            {chamados.map((c) => (
              <tr key={c.id}>

                <td>{c.titulo}</td>

                <td>
                  <span className={`status ${c.status}`}>
                    {c.status}
                  </span>
                </td>

                <td>{c.criado_em}</td>

              </tr>
            ))}

            {chamados.length === 0 && (
              <tr>
                <td colSpan={3}>
                  Nenhum chamado encontrado.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default SuporteCliente;