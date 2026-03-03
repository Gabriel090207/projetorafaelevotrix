import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import "../../../styles/planos.css";

import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
} from "react-icons/fi";

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
      nome: p.nome,
      velocidade_download: p.velocidade_download,
      velocidade_upload: p.velocidade_upload,
      valor: p.valor,
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
    if (!form.nome.trim()) {
      setError("Informe o nome do plano.");
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
    if (!confirm("Deseja excluir este plano?")) return;
    await api.delete(`/planos/${id}`);
    carregar();
  }

  const planosOrdenados = useMemo(() => {
    return [...planos].sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    );
  }, [planos]);

  return (
    <div className="planos-page">
      {/* HEADER */}
      <div className="planos-header">
        <h1>Planos</h1>

        <button className="btn-primary" onClick={abrirNovo}>
          <FiPlus />
          Novo Plano
        </button>
      </div>

      {/* TABELA */}
      <div className="planos-table-wrapper">
        <table className="planos-table">
          <thead>
            <tr>
              <th>Plano</th>
              <th>Download</th>
              <th>Upload</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5}>Carregando...</td>
              </tr>
            )}

            {!loading && planosOrdenados.length === 0 && (
              <tr>
                <td colSpan={5}>Nenhum plano cadastrado.</td>
              </tr>
            )}

            {planosOrdenados.map((p) => (
              <tr key={p.id}>
                <td className="strong">{p.nome}</td>
                <td>{p.velocidade_download} Mb</td>
                <td>{p.velocidade_upload} Mb</td>
                <td>
                  {Number(p.valor).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
                <td className="actions">
                  <FiEdit2 onClick={() => abrirEditar(p)} />
                  <FiTrash2 onClick={() => remover(p.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {open && (
        <div className="modal-overlay" onClick={fechar}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isEditing ? "Editar Plano" : "Novo Plano"}</h3>
              <FiX className="modal-close" onClick={fechar} />
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Nome</label>
                <input
                  value={form.nome}
                  onChange={(e) =>
                    setForm({ ...form, nome: e.target.value })
                  }
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Download (Mb)</label>
                  <input
                    type="number"
                    value={form.velocidade_download}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        velocidade_download: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Upload (Mb)</label>
                  <input
                    type="number"
                    value={form.velocidade_upload}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        velocidade_upload: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valor}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      valor: Number(e.target.value),
                    })
                  }
                />
              </div>

              {error && <div className="modal-error">{error}</div>}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={fechar}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={salvar}>
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