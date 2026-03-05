import "../../../styles/contratos.css";
import { FiMenu, FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { useState, useEffect } from "react";
import api from "../../../services/api";

const EMPRESA_ID = localStorage.getItem("empresa_id") || "";

interface Contrato {
  id: string;
  numero: string;
  cliente_nome: string;
  plano_nome: string;
  status: string;
  data_inicio: string;
}

let contratosCache: Contrato[] | null = null;

export default function Contratos() {

  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  async function carregarContratos() {
    try {

      if (contratosCache) {
        setContratos(contratosCache);
        return;
      }

      const response = await api.get(
        `/contratos/empresa/${EMPRESA_ID}`
      );

      contratosCache = response.data;

      setContratos(response.data);

    } catch (error) {
      console.error("Erro ao carregar contratos", error);
    }
  }

  useEffect(() => {
    carregarContratos();
  }, []);

  function formatarData(data: string) {
    const d = new Date(data);
    return d.toLocaleDateString("pt-BR");
  }

  async function cancelarContrato(id: string) {
    try {

      await api.patch(`/contratos/${EMPRESA_ID}/${id}/cancelar`);

      contratosCache = null;

      carregarContratos();

    } catch (error) {
      console.error("Erro ao cancelar contrato");
    }
  }

  return (
    <div className="contratos-page">

      {/* HEADER */}

      <div className="contratos-header">
        <h1>Contratos</h1>

        <button className="contratos-btn-primary">
          + Novo Contrato
        </button>
      </div>

      {/* KPIs */}

      <div className="contratos-kpis">

        <div className="contratos-card primary">
          <span>Contratos Ativos</span>
          <strong>
            {contratos.filter(c => c.status === "ATIVO").length}
          </strong>
        </div>

        <div className="contratos-card danger">
          <span>Cancelados</span>
          <strong>
            {contratos.filter(c => c.status === "CANCELADO").length}
          </strong>
        </div>

        <div className="contratos-card warning">
          <span>Assinatura Pendente</span>
          <strong>
            {contratos.filter(c => c.status === "PENDENTE").length}
          </strong>
        </div>

        <div className="contratos-card success">
          <span>Assinados no mês</span>
          <strong>
            {contratos.filter(c => {

              const data = new Date(c.data_inicio);
              const hoje = new Date();

              return (
                data.getMonth() === hoje.getMonth() &&
                data.getFullYear() === hoje.getFullYear()
              );

            }).length}
          </strong>
        </div>

      </div>

      {/* TABELA */}

      <div className="contratos-table-wrapper">

        <table className="contratos-table">

          <thead>
            <tr>
              <th>CLIENTE</th>
              <th>PLANO</th>
              <th>STATUS</th>
              <th>DATA</th>
              <th>AÇÕES</th>
            </tr>
          </thead>

          <tbody>

            {contratos.map((contrato) => (

              <tr key={contrato.id}>

                <td>{contrato.cliente_nome}</td>

                <td>{contrato.plano_nome}</td>

                <td>
                  <span
                    className={`contratos-status ${
                      contrato.status === "ATIVO"
                        ? "active"
                        : contrato.status === "CANCELADO"
                        ? "cancelled"
                        : "pending"
                    }`}
                  >
                    {contrato.status}
                  </span>
                </td>

                <td>{formatarData(contrato.data_inicio)}</td>

                <td>

                  <div className="contratos-options-wrapper">

                    <button
                      className="contratos-options-button"
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === contrato.id
                            ? null
                            : contrato.id
                        )
                      }
                    >
                      <FiMenu />
                    </button>

                    {openMenuId === contrato.id && (

                      <div className="contratos-options-menu">

                        <div className="contratos-option-item">
                          <FiEye /> Ver contrato
                        </div>

                        <div className="contratos-option-item">
                          <FiEdit /> Editar
                        </div>

                        <div
                          className="contratos-option-item danger"
                          onClick={() =>
                            cancelarContrato(contrato.id)
                          }
                        >
                          <FiTrash /> Cancelar
                        </div>

                      </div>

                    )}

                  </div>

                </td>

              </tr>

            ))}

            {contratos.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 16, opacity: 0.7 }}>
                  Nenhum contrato encontrado.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}