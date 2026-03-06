import { useEffect, useState } from "react";
import api from "../../../services/api";

import "../../../styles/monitoramento.css";

import {
  FaServer,
  FaMicrochip,
  FaMemory,
  FaNetworkWired,
  FaSyncAlt
} from "react-icons/fa";

const EMPRESA_ID = localStorage.getItem("empresa_id") || "";

interface Equipamento {
  nome: string;
  ip: string;
  cpu: number;
  memoria: number;
  uptime: string;
  trafego: number;
}

interface NocStats {
  equipamentos: number;
  mikrotiks: number;
  olts: number;
  onus: number;
  clientes: number;
}

let monitoramentoCache: Equipamento[] | null = null;

const Monitoramento = () => {

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [noc, setNoc] = useState<NocStats | null>(null);

  async function carregarMonitoramento() {

    try {

      if (monitoramentoCache) {
        setEquipamentos(monitoramentoCache);
      } else {

        const response = await api.get(`/monitoramento/empresa/${EMPRESA_ID}`);

        monitoramentoCache = response.data;

        setEquipamentos(response.data);
      }

      const nocRes = await api.get(`/monitoramento/noc`);

      setNoc(nocRes.data);

    } catch (error) {
      console.error("Erro monitoramento", error);
    }

  }

  useEffect(() => {
    carregarMonitoramento();
  }, []);

  return (

    <div className="monitoramento-page">

      <div className="monitoramento-header">

        <h1>Monitoramento da Rede</h1>

        <button
          className="btn-primary"
          onClick={() => {
            monitoramentoCache = null
            carregarMonitoramento()
          }}
        >
          <FaSyncAlt />
          Atualizar
        </button>

      </div>


      {/* KPI NOC */}

      <div className="monitoramento-kpis">

        <div className="kpi-card primary">
          <span>Equipamentos</span>
          <strong>{noc?.equipamentos || 0}</strong>
        </div>

        <div className="kpi-card warning">
          <span>Mikrotiks</span>
          <strong>{noc?.mikrotiks || 0}</strong>
        </div>

        <div className="kpi-card primary">
          <span>OLTs</span>
          <strong>{noc?.olts || 0}</strong>
        </div>

        <div className="kpi-card danger">
          <span>ONUs</span>
          <strong>{noc?.onus || 0}</strong>
        </div>

        <div className="kpi-card primary">
          <span>Clientes</span>
          <strong>{noc?.clientes || 0}</strong>
        </div>

      </div>


      {/* GRID EQUIPAMENTOS */}

      <div className="monitoramento-grid">

        {equipamentos.map((eq, index) => (

          <div key={index} className="equipamento-card">

            <div className="equipamento-card-header">

              <FaServer />

              <div>
                <strong>{eq.nome}</strong>
                <span>{eq.ip}</span>
              </div>

            </div>


            <div className="equipamento-stats">

              <div className="stat">

                <FaMicrochip />

                <div>
                  <span>CPU</span>
                  <strong>{eq.cpu}%</strong>
                </div>

              </div>


              <div className="stat">

                <FaMemory />

                <div>
                  <span>Memória</span>
                  <strong>{eq.memoria}%</strong>
                </div>

              </div>


              <div className="stat">

                <FaNetworkWired />

                <div>
                  <span>Tráfego</span>
                  <strong>{eq.trafego} Mbps</strong>
                </div>

              </div>

            </div>


            <div className="equipamento-footer">

              <span>Uptime</span>
              <strong>{eq.uptime}</strong>

            </div>

          </div>

        ))}

      </div>

    </div>

  )

}

export default Monitoramento;