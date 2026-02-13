import { useEffect, useState } from "react";
import api from "../services/api";

import "../styles/financeiro.css";
import {
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaSearch,
} from "react-icons/fa";

interface Cobranca {
  id: string;
  cliente_nome: string;
  valor: number;
  status: string;
  data_vencimento: string;
}

const Financeiro = () => {
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);

  async function carregarCobrancas() {
    try {
      const response = await api.get("/cobrancas");
      setCobrancas(response.data);
    } catch (error) {
      console.error("Erro ao carregar cobranças", error);
    }
  }

  useEffect(() => {
    carregarCobrancas();
  }, []);

  function formatarData(data: string) {
    const d = new Date(data);
    return d.toLocaleDateString("pt-BR");
  }

  function formatarValor(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="financeiro-page">
      {/* HEADER */}
      <div className="financeiro-header">
        <h1>Financeiro</h1>

        <button className="btn-primary">
          <FaFileInvoiceDollar />
          Emitir cobrança
        </button>
      </div>

      {/* KPIs */}
      <div className="financeiro-kpis">
        <div className="kpi-card">
          <span>Total cobranças</span>
          <strong>{cobrancas.length}</strong>
        </div>

        <div className="kpi-card warning">
          <span>Pendentes</span>
          <strong>
            {
              cobrancas.filter((c) => c.status === "pendente").length
            }
          </strong>
        </div>

        <div className="kpi-card danger">
          <span>Pagas</span>
          <strong>
            {cobrancas.filter((c) => c.status === "pago").length}
          </strong>
        </div>
      </div>

      {/* FILTROS */}
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
            <FaSearch />
            <input placeholder="Cliente, CPF ou fatura" />
          </div>
        </div>
      </div>

      {/* TABELA */}
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
                <td>{formatarData(cobranca.data_vencimento)}</td>
                <td>{formatarValor(cobranca.valor)}</td>

                <td>
                  <span
                    className={`status ${
                      cobranca.status === "pago"
                        ? "paid"
                        : "open"
                    }`}
                  >
                    {cobranca.status === "pago"
                      ? "Pago"
                      : "Em aberto"}
                  </span>
                </td>

                <td className="actions">
                  <FaMoneyBillWave />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Financeiro;
