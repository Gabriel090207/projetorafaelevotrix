import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/dashboard.css";

interface Fatura {
  id: string;
  valor: number;
  vencimento: string;
  status: string;
}

const DashboardCliente = () => {
  const [statusInternet, setStatusInternet] = useState("offline");
  const [plano, setPlano] = useState("");
  const [ipPublico, setIpPublico] = useState("-");
  const [velocidade, setVelocidade] = useState("-");
  const [fatura, setFatura] = useState<Fatura | null>(null);
  const [ultimasFaturas, setUltimasFaturas] = useState<Fatura[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const response = await api.get("/clientes/dashboard");
      setStatusInternet(response.data.status || "offline");
      setPlano(response.data.plano || "-");
      setIpPublico(response.data.ip || "-");
      setVelocidade(response.data.velocidade || "-");
      setFatura(response.data.fatura || null);
      setUltimasFaturas(response.data.ultimas_faturas || []);
    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    }
  }

  function formatarValor(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div className="cliente-dashboard">

      <h1>Meu Painel</h1>

      {/* ================= KPIs ================= */}

      <div className="dashboard-kpis">

        <div className="kpi-card danger">
          <span>Status da Internet</span>
          <strong>
            {statusInternet === "online" ? "Online" : "Offline"}
          </strong>
        </div>

        <div className="kpi-card warning">
          <span>Plano contratado</span>
          <strong>{plano}</strong>
        </div>

        <div className="kpi-card primary">
          <span>Próxima fatura</span>

          {fatura ? (
            <>
              <strong>{formatarValor(fatura.valor)}</strong>
              <small>Vencimento {fatura.vencimento}</small>

              <button
                className="btn-pagar"
                onClick={() => window.open(`/boleto/${fatura.id}`)}
              >
                Pagar
              </button>
            </>
          ) : (
            <strong>Sem faturas</strong>
          )}
        </div>

        <div className="kpi-card primary">
          <span>Velocidade</span>
          <strong>{velocidade}</strong>
        </div>

        <div className="kpi-card warning">
          <span>IP Público</span>
          <strong>{ipPublico}</strong>
        </div>

        <div className="kpi-card danger">
          <span>Chamados</span>
          <strong>0 abertos</strong>
        </div>

      </div>

      {/* ================= ÚLTIMAS FATURAS ================= */}

      <div className="dashboard-faturas">

        <h2>Últimas faturas</h2>

        <table className="faturas-table">

          <thead>
            <tr>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>

          <tbody>

            {ultimasFaturas.map((f) => (
              <tr key={f.id}>

                <td>{f.vencimento}</td>

                <td>{formatarValor(f.valor)}</td>

                <td>
                  <span
                    className={`status ${
                      f.status === "pago"
                        ? "paid"
                        : f.status === "vencido"
                        ? "overdue"
                        : "open"
                    }`}
                  >
                    {f.status}
                  </span>
                </td>

                <td>
                  <button
                    className="btn-pagar"
                    onClick={() => window.open(`/boleto/${f.id}`)}
                  >
                    Pagar
                  </button>
                </td>

              </tr>
            ))}

            {ultimasFaturas.length === 0 && (
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

export default DashboardCliente;