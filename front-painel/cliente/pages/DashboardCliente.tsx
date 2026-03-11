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


          <div className="kpi-card primary">
          <span>Próxima fatura</span>

          {fatura ? (
            <>
              <strong>{formatarValor(fatura.valor)}</strong>
              

            </>
          ) : (
            <strong>Sem faturas</strong>
          )}
        </div>


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

      
      

      </div>

      {/* ================= GRAFICO DE CONSUMO ================= */}

<div className="dashboard-grafico">

  <h2>Consumo de Internet</h2>

  <div className="grafico-box">
    <p>Gráfico de tráfego será exibido aqui</p>
  </div>

</div>

    </div>
  );
};

export default DashboardCliente;