import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/faturas.css";

import { FiMenu } from "react-icons/fi";

interface Fatura {
  id: string;
  valor: number;
  vencimento: any;
  status: string;
  linha_digitavel?: string;
  pix_copia_cola?: string;
}

const FaturasCliente = () => {

  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    carregarFaturas();
  }, []);

  async function carregarFaturas() {
    try {

      const empresaId = localStorage.getItem("empresa_id");
      const clienteId = localStorage.getItem("cliente_id");

      const response = await api.get(
        `/cobrancas/cliente/${empresaId}/${clienteId}`
      );

      setFaturas(response.data);

    } catch (error) {
      console.error("Erro ao carregar faturas", error);
    }
  }

  function formatarValor(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(data: any) {

    if (!data) return "-";

    if (data.seconds) {
      const d = new Date(data.seconds * 1000);
      return d.toLocaleDateString("pt-BR");
    }

    const d = new Date(data);

    if (isNaN(d.getTime())) return "-";

    return d.toLocaleDateString("pt-BR");
  }

  function normalizarStatus(status?: string) {

    const s = status?.toLowerCase();

    if (!s) return "open";

    if (["pendente", "aberto", "em_aberto", "em aberto"].includes(s))
      return "open";

    if (["pago", "paid"].includes(s))
      return "paid";

    if (["cancelado", "cancelled"].includes(s))
      return "cancelled";

    if (["vencido", "overdue"].includes(s))
      return "overdue";

    return "open";
  }

  return (
    <div className="faturas-page">

      <div className="faturas-header">
        <h1>Minhas Faturas</h1>
      </div>

      <div className="faturas-table-wrapper">

        <table className="faturas-table">

          <thead>
            <tr>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>

            {faturas.map((fatura) => {

              const statusNormalizado = normalizarStatus(fatura.status);

              return (
                <tr key={fatura.id}>

                  <td>{formatarData(fatura.vencimento)}</td>

                  <td>{formatarValor(fatura.valor)}</td>

                  <td>
                    <span className={`status ${statusNormalizado}`}>
                      {statusNormalizado === "paid"
                        ? "Pago"
                        : statusNormalizado === "cancelled"
                        ? "Cancelado"
                        : statusNormalizado === "overdue"
                        ? "Vencido"
                        : "Pendente"}
                    </span>
                  </td>

                  <td className="actions">

                    <div className="options-wrapper">

                      <button
                        className="options-button"
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === fatura.id ? null : fatura.id
                          )
                        }
                      >
                        <FiMenu />
                      </button>

                      {openMenuId === fatura.id && (
                        <div className="options-menu">

                          {fatura.pix_copia_cola && (
                            <div
                              className="option-item"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  fatura.pix_copia_cola || ""
                                );
                                setOpenMenuId(null);
                              }}
                            >
                              Copiar PIX
                            </div>
                          )}

                          {fatura.linha_digitavel && (
                            <div
                              className="option-item"
                              onClick={() => {
                                window.open(`/boleto/${fatura.id}`, "_blank");
                                setOpenMenuId(null);
                              }}
                            >
                              Ver Boleto
                            </div>
                          )}

                        </div>
                      )}

                    </div>

                  </td>

                </tr>
              );
            })}

            {faturas.length === 0 && (
              <tr>
                <td colSpan={4} className="empty">
                  Nenhuma fatura encontrada.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default FaturasCliente;