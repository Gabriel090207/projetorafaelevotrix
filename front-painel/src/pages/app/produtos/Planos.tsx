import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

import "../../../styles/planos.css";

type Plano = {
  id: string;
  nome: string;
  velocidade_download: number;
  velocidade_upload: number;
  valor: number;
  ativo?: boolean;
};

const emptyForm = {
  nome: "",
  velocidade_download: 300,
  velocidade_upload: 150,
  valor: 0,
};

const Planos = () => {
  const [loading, setLoading] = useState(true);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const isEditing = useMemo(() => !!editingId, [editingId]);

  async function carregar() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Plano[]>("/planos");
      setPlanos(res.data || []);
    } catch (e) {
      console.error(e);
      setError("Não foi possível carregar os planos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirNovo() {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function abrirEditar(p: Plano) {
    setEditingId(p.id);
    setForm({
      nome: p.nome || "",
      velocidade_download: Number(p.velocidade_download || 0),
      velocidade_upload: Number(p.velocidade_upload || 0),
      valor: Number(p.valor || 0),
    });
    setOpen(true);
  }

  function fechar() {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function salvar() {
    setError(null);

    if (!form.nome.trim()) {
      setError("Informe o nome do plano.");
      return;
    }

    if (form.velocidade_download <= 0 || form.velocidade_upload <= 0) {
      setError("Velocidades precisam ser maiores que 0.");
      return;
    }

    if (form.valor < 0) {
      setError("Valor não pode ser negativo.");
      return;
    }

    try {
      if (isEditing && editingId) {
        await api.put(`/planos/${editingId}`, form);
      } else {
        await api.post(`/planos`, form);
      }

      await carregar();
      fechar();
    } catch (e) {
      console.error(e);
      setError("Erro ao salvar plano.");
    }
  }

  async function remover(id: string) {
    const ok = confirm("Tem certeza que deseja excluir este plano?");
    if (!ok) return;

    try {
      await api.delete(`/planos/${id}`);
      await carregar();
    } catch (e) {
      console.error(e);
      alert("Não foi possível excluir o plano.");
    }
  }

  return (
    <div className="planos-page">
      <div className="planos-header">
        <div>
          <h2>Planos</h2>
          <p>Cadastre e gerencie seus planos de internet.</p>
        </div>

        <button className="planos-btn-primary" onClick={abrirNovo}>
          + Novo plano
        </button>
      </div>

      {error && <div className="planos-alert">{error}</div>}

      <div className="planos-card">
        <div className="planos-card-title">Lista de Planos</div>

        {loading ? (
          <div className="planos-empty">Carregando...</div>
        ) : planos.length === 0 ? (
          <div className="planos-empty">Nenhum plano cadastrado ainda.</div>
        ) : (
          <div className="planos-table-wrap">
            <table className="planos-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Download</th>
                  <th>Upload</th>
                  <th>Valor</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {planos.map((p) => (
                  <tr key={p.id}>
                    <td className="td-strong">{p.nome}</td>
                    <td>{p.velocidade_download} Mb</td>
                    <td>{p.velocidade_upload} Mb</td>
                    <td>
                      {Number(p.valor || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </td>
                    <td className="td-actions">
                      <button className="planos-btn" onClick={() => abrirEditar(p)}>
                        Editar
                      </button>
                      <button className="planos-btn danger" onClick={() => remover(p.id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="planos-modal-overlay" onClick={fechar}>
          <div className="planos-modal" onClick={(e) => e.stopPropagation()}>
            <div className="planos-modal-title">
              {isEditing ? "Editar plano" : "Novo plano"}
            </div>

            <div className="planos-modal-body">
              <div className="planos-field">
                <label>Nome</label>
                <input
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  placeholder="Ex: 500 MEGA"
                />
              </div>

              <div className="planos-grid-2">
                <div className="planos-field">
                  <label>Download (Mb)</label>
                  <input
                    type="number"
                    value={form.velocidade_download}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        velocidade_download: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div className="planos-field">
                  <label>Upload (Mb)</label>
                  <input
                    type="number"
                    value={form.velocidade_upload}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        velocidade_upload: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="planos-field">
                <label>Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valor}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, valor: Number(e.target.value) }))
                  }
                />
              </div>

              {error && <div className="planos-alert">{error}</div>}
            </div>

            <div className="planos-modal-actions">
              <button className="planos-btn" onClick={fechar}>
                Cancelar
              </button>
              <button className="planos-btn-primary" onClick={salvar}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planos;