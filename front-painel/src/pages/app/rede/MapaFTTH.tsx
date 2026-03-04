import "../../../styles/mapa-ftth.css";
import { FaPlus } from "react-icons/fa";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";


import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ctoIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png",
  iconSize: [32, 32],
});

const clienteOnlineIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
  iconSize: [28, 28],
});

const clienteOfflineIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/463/463612.png",
  iconSize: [28, 28],
});

const MapaFTTH = () => {

  const [ctos, setCtos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);

  const center = [-20.3155, -40.3128];


  const [totalProjetos, setTotalProjetos] = useState<number>(0);
const [totalCtos, setTotalCtos] = useState<number>(0);
const [portasLivres, setPortasLivres] = useState<number>(0);
const [portasOcupadas, setPortasOcupadas] = useState<number>(0);

  useEffect(() => {
    carregarMapa();
  }, []);

  const carregarMapa = async () => {

    const token = localStorage.getItem("token");
    const empresaId = localStorage.getItem("empresa_id");

    const res = await fetch(`${import.meta.env.VITE_API_URL}/mapa-ftth`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Empresa-Id": empresaId || ""
      }
    });

    const data = await res.json();

    setCtos(data.ctos || []);
    setClientes(data.clientes || []);


    const listaCtos = data.ctos || [];
const listaClientes = data.clientes || [];

setTotalCtos(listaCtos.length);

// calcular portas
let livres = 0;
let ocupadas = 0;

listaCtos.forEach((cto: any) => {
  const portas = cto.portas || 0;

 const clientesNaCto = listaClientes.filter(
  (c: any) => c.cto_id === cto.id && c.porta_cto
).length;

  ocupadas += clientesNaCto;
  livres += portas - clientesNaCto;
});

setPortasLivres(livres);
setPortasOcupadas(ocupadas);

// projetos (por enquanto fixo)
setTotalProjetos(1);

  };

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

      {/* CARDS */}
      <div className="ftth-cards">

        <div className="ftth-card primary">
          <div className="ftth-card-content">
            <span>Projetos</span>
           <strong>{totalProjetos}</strong>
          </div>
        </div>

        <div className="ftth-card success">
          <div className="ftth-card-content">
            <span>CTOs Ativas</span>
            <strong>{totalCtos}</strong>
          </div>
        </div>

        <div className="ftth-card warning">
          <div className="ftth-card-content">
            <span>Portas Livres</span>
            <strong>{portasLivres}</strong>
          </div>
        </div>

        <div className="ftth-card danger">
          <div className="ftth-card-content">
            <span>Portas Ocupadas</span>
           <strong>{portasOcupadas}</strong>
          </div>
        </div>

      </div>

      {/* MAPA */}
      <div className="ftth-map-container">

        <MapContainer
          center={center as any}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >

          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* CTOs */}
          {ctos.map((cto: any) => {

            const pos = [
              Number(cto.latitude),
              Number(cto.longitude)
            ];

            return (
             <Marker
  key={cto.id}
  position={pos as any}
  icon={ctoIcon}
>
                <Popup>
                  <b>{cto.nome}</b>
                  <br />
                  Portas: {cto.portas}
                </Popup>
              </Marker>
            );

          })}

          {/* CLIENTES */}
          {clientes.map((cliente: any) => {

            if (!cliente.latitude || !cliente.longitude) return null;

            const pos = [
              Number(cliente.latitude),
              Number(cliente.longitude)
            ];

            return (
              <Marker
  key={cliente.id}
  position={pos as any}
  icon={
    cliente.conexao_status === "online"
      ? clienteOnlineIcon
      : clienteOfflineIcon
  }
>
                <Popup>
  <b>{cliente.nome}</b>
  <br />
  Status: {cliente.conexao_status}
  <br />
  Documento: {cliente.documento}
</Popup>
              </Marker>
            );

          })}

        </MapContainer>

      </div>

    </div>
  );
};

export default MapaFTTH;