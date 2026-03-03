import "../../../styles/contratos.css";
import { FiMenu, FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { useState } from "react";

export default function Contratos() {


    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
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
          <strong>1.245</strong>
        </div>

       
        <div className="contratos-card danger">
          <span>Cancelados</span>
          <strong>12</strong>
        </div>

         <div className="contratos-card warning">
          <span>Assinatura Pendente</span>
          <strong>32</strong>
        </div>

        <div className="contratos-card success">
          <span>Assinados no mês</span>
          <strong>87</strong>
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
            <tr>
              <td>João Silva</td>
              <td>Plano 600MB</td>
              <td>
                <span className="contratos-status active">
                  Ativo
                </span>
              </td>
              <td>01/03/2026</td>
              <td>
  <div className="contratos-options-wrapper">
    <button
      className="contratos-options-button"
      onClick={() =>
        setOpenMenuId(openMenuId === "1" ? null : "1")
      }
    >
      <FiMenu />
    </button>

    {openMenuId === "1" && (
      <div className="contratos-options-menu">
        <div className="contratos-option-item">
          <FiEye /> Ver contrato
        </div>

        <div className="contratos-option-item">
          <FiEdit /> Editar
        </div>

        <div className="contratos-option-item danger">
          <FiTrash /> Cancelar
        </div>
      </div>
    )}
  </div>
</td>
            </tr>
          </tbody>

        </table>
      </div>

    </div>
  );
}