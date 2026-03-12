import { useEffect, useState } from "react";
import api from "../../src/services/api";

import "../styles/perfil.css";

interface Tecnico {
  nome: string;
  email: string;
}

const PerfilTecnico = () => {

  const [tecnico, setTecnico] = useState<Tecnico | null>(null);

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {

    try {

    const response = await api.get("/auth/me");

      setTecnico(response.data);

    } catch (error) {

      console.error("Erro ao carregar perfil", error);

    }

  }

  if (!tecnico) {

    return (
      <div className="perfil-page">
        Carregando...
      </div>
    );

  }

  return (

    <div className="perfil-page">

      <h1>Meu Perfil</h1>

      <div className="perfil-card">

        <div className="perfil-item">
          <span>Nome</span>
          <strong>{tecnico.nome}</strong>
        </div>

        <div className="perfil-item">
          <span>Email</span>
          <strong>{tecnico.email}</strong>
        </div>

      
        <button className="btn-red">
          Alterar senha
        </button>

      </div>

    </div>

  );

};

export default PerfilTecnico;