import { useEffect, useState } from "react";
import "../../styles/usuarios.css";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
};

const UsuariosPanel = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [toast, setToast] = useState<{
    tipo: "sucesso" | "erro";
    mensagem: string;
  } | null>(null);

  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    perfil: "Administrador",
    senha: "",
    ativo: true,
  });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function carregarUsuarios() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8000/usuarios/", {
       headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
  "X-Empresa-Id": localStorage.getItem("empresa_id") || "",
},
      });

      const data = await response.json();

      if (Array.isArray(data)) {
        setUsuarios(data);
      } else {
        setUsuarios([]);
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }

  async function criarUsuario() {
    try {
      setSalvando(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8000/usuarios/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novoUsuario),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar usuário");
      }

      setToast({
        tipo: "sucesso",
        mensagem: "Usuário criado com sucesso!",
      });

      setModalAberto(false);
      setNovoUsuario({
        nome: "",
        email: "",
        perfil: "Administrador",
        senha: "",
        ativo: true,
      });

      carregarUsuarios();
    } catch (error) {
      setToast({
        tipo: "erro",
        mensagem: "Erro ao criar usuário.",
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="usuarios-panel">

      {/* TOAST */}
      {toast && (
        <div className="toast-wrapper">
          <div className={`toast ${toast.tipo}`}>
            {toast.mensagem}
          </div>
        </div>
      )}

      <div className="usuarios-header">
        <h2>Usuários do Sistema</h2>
        <button className="btn-primary" onClick={() => setModalAberto(true)}>
          + Novo Usuário
        </button>
      </div>

      {loading ? (
        <p>Carregando usuários...</p>
      ) : (
        <div className="usuarios-table">

          <div className="usuarios-row usuarios-header-row">
            <div>Nome</div>
            <div>Email</div>
            <div>Perfil</div>
            <div>Status</div>
          </div>

          {usuarios.length === 0 && (
            <div className="usuarios-row">
              <div>Nenhum usuário cadastrado.</div>
            </div>
          )}

          {usuarios.map((usuario) => (
            <div key={usuario.id} className="usuarios-row">
              <div>{usuario.nome}</div>
              <div>{usuario.email}</div>
              <div>{usuario.perfil}</div>
              <div>
                <span
                  className={
                    usuario.ativo ? "badge-success" : "badge-danger"
                  }
                >
                  {usuario.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAberto && (
        <div className="usuario-modal">
          <div className="modal-content">

            <div className="modal-header">
              <h3>Novo Usuário</h3>
              <button onClick={() => setModalAberto(false)}>✕</button>
            </div>

            <div className="modal-form">
              <label>Nome</label>
              <input
                value={novoUsuario.nome}
                onChange={(e) =>
                  setNovoUsuario({ ...novoUsuario, nome: e.target.value })
                }
              />

              <label>Email</label>
              <input
                value={novoUsuario.email}
                onChange={(e) =>
                  setNovoUsuario({ ...novoUsuario, email: e.target.value })
                }
              />

              <label>Perfil</label>
              <select
                value={novoUsuario.perfil}
                onChange={(e) =>
                  setNovoUsuario({ ...novoUsuario, perfil: e.target.value })
                }
              >
                <option>Administrador</option>
                <option>Técnico</option>
                <option>Financeiro</option>
              </select>

              <label>Senha</label>
              <input
                type="password"
                value={novoUsuario.senha}
                onChange={(e) =>
                  setNovoUsuario({ ...novoUsuario, senha: e.target.value })
                }
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setModalAberto(false)}
              >
                Cancelar
              </button>

              <button
                className="btn-primary"
                onClick={criarUsuario}
                disabled={salvando}
              >
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosPanel;