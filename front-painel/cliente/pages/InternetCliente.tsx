import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/internet.css";

import { FiRefreshCw, FiPower } from "react-icons/fi";

interface InternetStatus {
  status: string;
  ip: string;
  ultima_conexao: string;
  reconexoes: number;
  download: string;
  upload: string;
  nas?: string;
  service?: string;
}

const InternetCliente = () => {

  const [dados, setDados] = useState<InternetStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarStatus();

    const interval = setInterval(() => {
      carregarStatus();
    }, 10000); // atualiza a cada 10s

    return () => clearInterval(interval);

  }, []);

  async function carregarStatus() {

    try {

      setLoading(true);

      const response = await api.get("/cliente/internet");

      setDados(response.data);

    } catch (error) {

      console.error("Erro ao carregar status internet", error);

    } finally {

      setLoading(false);

    }

  }

  async function reiniciarOnu() {

    try {

      await api.post("/cliente/reiniciar-onu");

      alert("ONU reiniciada com sucesso");

      carregarStatus();

    } catch (error) {

      console.error(error);

      alert("Erro ao reiniciar ONU");

    }

  }

  return (

    <div className="internet-page">

      <div className="internet-header">
        <h1>Minha Internet</h1>

        {loading && (
          <span className="internet-loading">
            Atualizando...
          </span>
        )}
      </div>

      <div className="internet-card">

        {/* STATUS PRINCIPAL */}

        <div className="internet-status">

          <span
            className={
              dados?.status === "online"
                ? "badge-online"
                : "badge-offline"
            }
          >
            {dados?.status?.toUpperCase() || "OFFLINE"}
          </span>

          <div className="internet-ip">
            IP Público: {dados?.ip || "-"}
          </div>

        </div>

        {/* GRID DE INFORMAÇÕES */}

        <div className="internet-grid">

          <div className="internet-item">
            <span>Última conexão</span>
            <strong>{dados?.ultima_conexao || "-"}</strong>
          </div>

          <div className="internet-item">
            <span>Reconexões (24h)</span>
            <strong>{dados?.reconexoes ?? 0}</strong>
          </div>

          <div className="internet-item">
            <span>Download</span>
            <strong>{dados?.download || "0 MB"}</strong>
          </div>

          <div className="internet-item">
            <span>Upload</span>
            <strong>{dados?.upload || "0 MB"}</strong>
          </div>

          <div className="internet-item">
            <span>NAS</span>
            <strong>{dados?.nas || "-"}</strong>
          </div>

          <div className="internet-item">
            <span>Serviço</span>
            <strong>{dados?.service || "-"}</strong>
          </div>

        </div>

        {/* BOTÕES */}

        <div className="internet-actions">

          <button
            className="btn-red"
            onClick={carregarStatus}
          >
            <FiRefreshCw />
            Atualizar
          </button>

          <button
            className="btn-red"
            onClick={reiniciarOnu}
          >
            <FiPower />
            Reiniciar ONU
          </button>

        </div>

      </div>

    </div>
  );
};

export default InternetCliente;