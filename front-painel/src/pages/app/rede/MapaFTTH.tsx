import "../../../styles/mapa-ftth.css";
import {  FaPlus } from "react-icons/fa";

const MapaFTTH = () => {
  return (
    <div className="ftth-page">

      {/* HEADER */}
      <div className="ftth-header">
        <h1>Mapa FTTH</h1>

        <button className="btn-primary">
          <FaPlus />
          Novo Projeto
        </button>
      </div>

      {/* CARDS RESUMO */}
      <div className="ftth-cards">
  <div className="ftth-card primary">
    <div className="ftth-card-content">
      <span>Projetos</span>
      <strong>3</strong>
    </div>
  </div>

  <div className="ftth-card success">
    <div className="ftth-card-content">
      <span>CTOs Ativas</span>
      <strong>48</strong>
    </div>
  </div>

  <div className="ftth-card warning">
    <div className="ftth-card-content">
      <span>Portas Livres</span>
      <strong>112</strong>
    </div>
  </div>

  <div className="ftth-card danger">
    <div className="ftth-card-content">
      <span>Portas Ocupadas</span>
      <strong>386</strong>
    </div>
  </div>
</div>


      {/* ÁREA DO MAPA */}
      <div className="ftth-map-container">
        <div className="ftth-map-placeholder">
          Área do Mapa FTTH (Leaflet ou Google Maps entra aqui)
        </div>
      </div>

    </div>
  );
};

export default MapaFTTH;