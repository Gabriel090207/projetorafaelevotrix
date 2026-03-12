import {
  FaClipboardList,
  FaTools,
  FaExclamationTriangle,
  FaUserCheck,
  FaMapMarkedAlt,
  FaWifi
} from "react-icons/fa";

import "../styles/dashboard.css";

const DashboardTecnico = () => {

  const ordensPendentes = 8;
  const ordensAndamento = 3;
  const ordensUrgentes = 2;
  const ordensConcluidas = 6;

  return (
    <div className="dashboard-page">

      <h1>Dashboard Técnico</h1>

      <div className="dashboard-top">

        <div className="dash-card warning">
          <div className="dash-card-header">
            <div className="dash-card-icon">
              <FaClipboardList />
            </div>
          </div>

          <div className="dash-card-body">
            <div className="dash-card-value">{ordensPendentes}</div>
            <div className="dash-card-title">Ordens Pendentes</div>
          </div>
        </div>

        <div className="dash-card primary">
          <div className="dash-card-header">
            <div className="dash-card-icon">
              <FaTools />
            </div>
          </div>

          <div className="dash-card-body">
            <div className="dash-card-value">{ordensAndamento}</div>
            <div className="dash-card-title">Em Atendimento</div>
          </div>
        </div>

        <div className="dash-card danger">
          <div className="dash-card-header">
            <div className="dash-card-icon">
              <FaExclamationTriangle />
            </div>
          </div>

          <div className="dash-card-body">
            <div className="dash-card-value">{ordensUrgentes}</div>
            <div className="dash-card-title">Urgentes</div>
          </div>
        </div>

        <div className="dash-card success">
          <div className="dash-card-header">
            <div className="dash-card-icon">
              <FaUserCheck />
            </div>
          </div>

          <div className="dash-card-body">
            <div className="dash-card-value">{ordensConcluidas}</div>
            <div className="dash-card-title">Concluídas Hoje</div>
          </div>
        </div>

      </div>


      <div className="dashboard-panels">

        <div className="dashboard-panel attention">
          <div className="dashboard-panel-header">
            <div className="dashboard-panel-icon">
              <FaClipboardList />
            </div>
            <h3>Ordens</h3>
          </div>

          <ul>
            <li>{ordensPendentes} ordens pendentes</li>
            <li>{ordensAndamento} em atendimento</li>
            <li>{ordensUrgentes} urgentes</li>
          </ul>
        </div>


        <div className="dashboard-panel network">
          <div className="dashboard-panel-header">
            <div className="dashboard-panel-icon">
              <FaMapMarkedAlt />
            </div>
            <h3>Mapa</h3>
          </div>

          <ul>
            <li>Visualizar localização do cliente</li>
            <li>Abrir rota no mapa</li>
          </ul>
        </div>


        <div className="dashboard-panel finance">
          <div className="dashboard-panel-header">
            <div className="dashboard-panel-icon">
              <FaWifi />
            </div>
            <h3>Equipamentos</h3>
          </div>

          <ul>
            <li>Registrar ONU instalada</li>
            <li>Registrar roteador</li>
          </ul>
        </div>

      </div>

    </div>
  );
};

export default DashboardTecnico;