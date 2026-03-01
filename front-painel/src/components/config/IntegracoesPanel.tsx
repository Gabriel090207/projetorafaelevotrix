import { useEffect, useState } from "react";
import "../../styles/integracoes.css";
import {
  FaServer,
  FaBars,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

type Integracao = {
  id: string;
  nome: string;
  descricao: string;
  icon: React.ReactNode;
};

const integracoesDisponiveis: Integracao[] = [
  { id: "sgp", nome: "SGP", descricao: "Integração com SGP", icon: <FaServer /> },
];

type IntegracaoSalva = {
  id: string;
  tipo: string;
  nome: string;
  ativo: boolean;
};

const IntegracoesPanel = () => {
  const [selecionada, setSelecionada] = useState<Integracao | null>(null);
  const [integracoes, setIntegracoes] = useState<IntegracaoSalva[]>([]);

  const [nomeIntegracao, setNomeIntegracao] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [appKey, setAppKey] = useState("");
  const [tokenSgp, setTokenSgp] = useState("");

  useEffect(() => {
    carregarIntegracoes();
  }, []);

  async function carregarIntegracoes() {
    try {
      const empresaId = localStorage.getItem("empresa_id");
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:8000/integracoes/${empresaId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setIntegracoes(data);
    } catch (err) {
      console.error("Erro ao carregar integrações", err);
    }
  }

  async function salvarIntegracao() {
    try {
      const empresaId = localStorage.getItem("empresa_id");
      const token = localStorage.getItem("token");

      const payload = {
        empresa_id: empresaId,
        tipo: selecionada?.id,
        nome: nomeIntegracao,
        config: {
          base_url: baseUrl,
          app: appKey,
          token: tokenSgp,
          verify_ssl: true,
        },
        ativo: true,
      };

      const response = await fetch("http://localhost:8000/integracoes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error();
      }

      alert("Integração salva com sucesso!");

      setSelecionada(null);
      setNomeIntegracao("");
      setBaseUrl("");
      setAppKey("");
      setTokenSgp("");

      carregarIntegracoes();
    } catch {
      alert("Erro ao salvar integração");
    }
  }

  return (
    <div className="integracoes-panel">
      <div className="panel-header">
        <h2>Integrações</h2>
        <p>Configure as integrações do provedor.</p>
      </div>

      {/* DISPONÍVEIS */}
      <div className="integracoes-grid">
        {integracoesDisponiveis.map((item) => (
          <button
            key={item.id}
            className="integracao-card"
            onClick={() => setSelecionada(item)}
          >
            <div className="integracao-icon">{item.icon}</div>
            <div>
              <h3>{item.nome}</h3>
              <p>{item.descricao}</p>
            </div>
          </button>
        ))}
      </div>

      {/* LISTA SALVAS */}
      <div className="integracoes-lista">
        <table className="integracoes-table">
          <thead>
            <tr>
              <th>Sistema</th>
              <th>Nome</th>
              <th>Status</th>
              <th>Opções</th>
            </tr>
          </thead>
          <tbody>
            {integracoes.map((item) => (
              <tr key={item.id}>
                <td>{item.tipo.toUpperCase()}</td>
                <td>{item.nome}</td>
                <td>
                  <span
                    className={`status-badge ${
                      item.ativo ? "conectado" : "erro"
                    }`}
                  >
                    {item.ativo ? "ATIVO" : "INATIVO"}
                  </span>
                </td>
                <td>
                  <div className="acoes">
                    <FaBars />
                    <FaEdit />
                    <FaTrash />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selecionada && (
        <div className="integracao-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Configurar {selecionada.nome}</h3>
              <button onClick={() => setSelecionada(null)}>✕</button>
            </div>

            <div className="modal-form">
              <label>Nome da integração</label>
              <input
                value={nomeIntegracao}
                onChange={(e) => setNomeIntegracao(e.target.value)}
              />

              <label>Base URL</label>
              <input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />

              <label>App</label>
              <input
                value={appKey}
                onChange={(e) => setAppKey(e.target.value)}
              />

              <label>Token</label>
              <input
                type="password"
                value={tokenSgp}
                onChange={(e) => setTokenSgp(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setSelecionada(null)}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={salvarIntegracao}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegracoesPanel;