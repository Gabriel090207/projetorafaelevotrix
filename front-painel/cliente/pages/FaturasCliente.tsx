import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/faturas.css";

interface Fatura {
  id: string;
  valor: number;
  vencimento: string;
  status: string;
  linha_digitavel?: string;
  pix_copia_cola?: string;
}

const FaturasCliente = () => {

  const [faturas, setFaturas] = useState<Fatura[]>([]);

  useEffect(() => {
    carregarFaturas();
  }, []);

  async function carregarFaturas() {
    try {
      const response = await api.get("/cliente/faturas");
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

            {faturas.map((fatura) => (
              <tr key={fatura.id}>

                <td>{fatura.vencimento}</td>

                <td>{formatarValor(fatura.valor)}</td>

                <td>
                  <span className={`status ${fatura.status}`}>
                    {fatura.status}
                  </span>
                </td>

                <td className="actions">

                  {fatura.pix_copia_cola && (
                    <button
                      className="btn-pix"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          fatura.pix_copia_cola || ""
                        )
                      }
                    >
                      Copiar PIX
                    </button>
                  )}

                  {fatura.linha_digitavel && (
                    <button
                      className="btn-boleto"
                      onClick={() =>
                        window.open(`/boleto/${fatura.id}`, "_blank")
                      }
                    >
                      Boleto
                    </button>
                  )}

                </td>

              </tr>
            ))}

            {faturas.length === 0 && (
              <tr>
                <td colSpan={4}>Nenhuma fatura encontrada.</td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default FaturasCliente;