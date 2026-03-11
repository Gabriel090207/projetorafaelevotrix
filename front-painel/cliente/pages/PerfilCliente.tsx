import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/perfil.css";

interface Cliente {
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  endereco: string;
  plano_id: string;
}

const PerfilCliente = () => {

  const [cliente, setCliente] = useState<Cliente | null>(null);

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {

    try {

    

      const clienteId = localStorage.getItem("cliente_id");
const response = await api.get(`/clientes/${clienteId}`);

      setCliente(response.data);

    } catch (error) {

      console.error("Erro ao carregar perfil", error);

    }

  }

  if (!cliente) {

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
          <strong>{cliente.nome}</strong>
        </div>

        <div className="perfil-item">
          <span>Email</span>
          <strong>{cliente.email}</strong>
        </div>

        <div className="perfil-item">
          <span>Telefone</span>
          <strong>{cliente.telefone}</strong>
        </div>

        <div className="perfil-item">
          <span>Documento</span>
          <strong>{cliente.documento}</strong>
        </div>

        <div className="perfil-item">
          <span>Endereço</span>
          <strong>{cliente.endereco}</strong>
        </div>

        <div className="perfil-item">
          <span>Plano contratado</span>
          <strong>{cliente.plano_id}</strong>
        </div>

        <button className="btn-red">
          Alterar senha
        </button>

      </div>

    </div>

  );

};

export default PerfilCliente;