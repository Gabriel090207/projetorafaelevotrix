import { useEffect, useState } from "react";
import api from "../../../services/api";

import "../../../styles/financeiro.css";
import {
  FaMoneyBillWave,
  FaFileInvoiceDollar,

} from "react-icons/fa";


import {  FiSearch,
 } from "react-icons/fi";


const EMPRESA_ID = localStorage.getItem("empresa_id") || "";

interface Cobranca {
  id: string;
  cliente_nome: string;
  valor: number;
  status: string;
  vencimento: any;
}

// 🔥 CACHE GLOBAL EM MEMÓRIA
let cobrancasCache: Cobranca[] | null = null;

const Financeiro = () => {
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);

  async function carregarCobrancas() {
    try {
      // 🔥 Se já tiver cache, usa ele
      if (cobrancasCache) {
        setCobrancas(cobrancasCache);
        return;
      }

      const response = await api.get(
  `/cobrancas/empresa/${EMPRESA_ID}`
);
      // 🔥 Salva no cache
      cobrancasCache = response.data;

      setCobrancas(response.data);
    } catch (error) {
      console.error("Erro ao carregar cobranças", error);
    }
  }

  useEffect(() => {
    carregarCobrancas();
  }, []);

 function formatarData(data: any) {
  if (!data) return "-";

  // 🔥 Firestore Timestamp
  if (data.seconds) {
    const d = new Date(data.seconds * 1000);
    return d.toLocaleDateString("pt-BR");
  }

  // 🔥 string ISO ou Date normal
  const d = new Date(data);

  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("pt-BR");
}

  function formatarValor(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function normalizarStatus(status?: string) {
  const s = status?.toLowerCase();

  if (!s) return "desconhecido";

  if (["pendente", "aberto", "em_aberto", "em aberto"].includes(s))
    return "aberto";

  if (["pago", "paid"].includes(s))
    return "pago";

  if (["cancelado", "cancelled"].includes(s))
    return "cancelado";

  if (["vencido", "overdue"].includes(s))
    return "vencido";

  return s;
}

  return (
    <div className="financeiro-page">
      <div className="financeiro-header">
        <h1>Financeiro</h1>

        <button className="btn-primary">
          <FaFileInvoiceDollar />
          Emitir cobrança
        </button>
      </div>

      <div className="financeiro-kpis">
        <div className="kpi-card primary">
          <span>Total cobranças</span>
          <strong>{cobrancas.length}</strong>
        </div>

        <div className="kpi-card warning">
  <span>Em Aberto</span>
  <strong>
    {cobrancas.filter(
  (c) => normalizarStatus(c.status) === "aberto"
).length}
  </strong>
</div>

        <div className="kpi-card danger">
          <span>Pagas</span>
          <strong>
            {cobrancas.filter(
  (c) => normalizarStatus(c.status) === "pago"
).length}
          </strong>
        </div>
      </div>

      <div className="financeiro-filters">
        <div className="filter-group">
          <label>Status</label>
          <select>
            <option>Todos</option>
            <option>Pago</option>
            <option>Em aberto</option>
            <option>Vencido</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Forma</label>
          <select>
            <option>Todas</option>
            <option>Boleto</option>
            <option>PIX</option>
            <option>Cartão</option>
          </select>
        </div>

        <div className="filter-group search">
          <label>Buscar</label>
          <div className="search-input">
            <FiSearch />
            <input placeholder="Cliente, CPF ou fatura" />
          </div>
        </div>
      </div>

      <div className="financeiro-table-wrapper">
        <table className="financeiro-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

         <tbody>
  {cobrancas.map((cobranca) => (
    <tr key={cobranca.id}>
      <td>{cobranca.cliente_nome}</td>
    <td>{formatarData(cobranca.vencimento)}</td>
      <td>{formatarValor(cobranca.valor)}</td>

      <td>
        <span
          className={`status ${
            cobranca.status?.toLowerCase() === "pago"
              ? "paid"
              : cobranca.status?.toLowerCase() === "cancelado"
              ? "cancelled"
              : "open"
          }`}
        >
          {normalizarStatus(cobranca.status) === "pago"
  ? "Pago"
  : normalizarStatus(cobranca.status) === "cancelado"
  ? "Cancelado"
  : "Em aberto"}
        </span>
      </td>

      <td className="actions">
        <FaMoneyBillWave />
      </td>
    </tr>
  ))}

{cobrancas.length === 0 && (
  <tr>
    <td
      colSpan={5}
      style={{
        padding: "16px 14px",
        opacity: 0.7,
        fontSize: "14px"
      }}
    >
      Nenhuma cobrança encontrada.
    </td>
  </tr>
)}
</tbody>
        </table>
      </div>
    </div>
  );
};

export default Financeiro;