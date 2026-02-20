import { useState } from "react";
import "../../styles/usuarios.css";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
};

const UsuariosPanel = () => {
  const [usuarios] = useState<Usuario[]>([
    {
      id: "1",
      nome: "Administrador",
      email: "admin@provedor.com",
      perfil: "Administrador",
      ativo: true,
    },
    {
      id: "2",
      nome: "Técnico João",
      email: "tecnico@provedor.com",
      perfil: "Técnico",
      ativo: true,
    },
  ]);

  const [modalAberto, setModalAberto] = useState(false);

  return (
    <div className="usuarios-panel">
      <div className="usuarios-header">
        <h2>Usuários do Sistema</h2>
        <button className="btn-primary" onClick={() => setModalAberto(true)}>
          + Novo Usuário
        </button>
      </div>

      <div className="usuarios-table">

        {/* HEADER */}
        <div className="usuarios-row usuarios-header-row">
          <div>Nome</div>
          <div>Email</div>
          <div>Perfil</div>
          <div>Status</div>
        </div>

        {/* LINHAS */}
        {usuarios.map((usuario) => (
          <div key={usuario.id} className="usuarios-row">
            <div>{usuario.nome}</div>
            <div>{usuario.email}</div>
            <div>{usuario.perfil}</div>
            <div>
              <span className={usuario.ativo ? "badge-success" : "badge-danger"}>
                {usuario.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {modalAberto && (
        <div className="usuario-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Novo Usuário</h3>
              <button onClick={() => setModalAberto(false)}>✕</button>
            </div>

            <div className="modal-form">
              <label>Nome</label>
              <input placeholder="Nome completo" />

              <label>Email</label>
              <input placeholder="email@provedor.com" />

              <label>Perfil</label>
              <select>
                <option>Administrador</option>
                <option>Técnico</option>
                <option>Financeiro</option>
              </select>

              <label>Senha</label>
              <input type="password" placeholder="Senha" />
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setModalAberto(false)}
              >
                Cancelar
              </button>
              <button className="btn-primary">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosPanel;