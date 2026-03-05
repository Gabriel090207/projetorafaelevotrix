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
  const [portasCto, setPortasCto] = useState<any>({});

  const [totalProjetos, setTotalProjetos] = useState(0);
  const [totalCtos, setTotalCtos] = useState(0);

  const [portasLivres, setPortasLivres] = useState(0);
  const [portasOcupadas, setPortasOcupadas] = useState(0);

  const [modalProjeto, setModalProjeto] = useState(false);

  const [nomeProjeto, setNomeProjeto] = useState("");
  const [descricaoProjeto, setDescricaoProjeto] = useState("");

  const center = [-20.3155, -40.3128];

  useEffect(() => {
    carregarMapa();
  }, []);

  async function carregarMapa() {

    const token = localStorage.getItem("token");
    const empresaId = localStorage.getItem("empresa_id");

    const res = await fetch(`${import.meta.env.VITE_API_URL}/mapa-ftth`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Empresa-Id": empresaId || ""
      }
    });

    const data = await res.json();

    const listaCtos = data.ctos || [];
    const listaClientes = data.clientes || [];
    const listaProjetos = data.projetos || [];

    setCtos(listaCtos);
    setClientes(listaClientes);
    setTotalCtos(listaCtos.length);
    setTotalProjetos(listaProjetos.length);

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

  }

  async function carregarPortasCto(ctoId: string) {

    const token = localStorage.getItem("token");
    const empresaId = localStorage.getItem("empresa_id");

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/ctos/${ctoId}/portas`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Empresa-Id": empresaId || ""
        }
      }
    );

    const data = await res.json();

    setPortasCto((prev: any) => ({
      ...prev,
      [ctoId]: data
    }));
  }

  async function criarProjeto() {

    const token = localStorage.getItem("token");
    const empresaId = localStorage.getItem("empresa_id");

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/mapa-ftth/projetos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Empresa-Id": empresaId || ""
        },
        body: JSON.stringify({
          nome: nomeProjeto,
          descricao: descricaoProjeto
        })
      }
    );

    if (!res.ok) {
      alert("Erro ao criar projeto");
      return;
    }

    setModalProjeto(false);
    setNomeProjeto("");
    setDescricaoProjeto("");

    carregarMapa();
  }

  return (
    <div className="ftth-page">

      <div className="ftth-header">
        <h1>Mapa FTTH</h1>

        <button
          className="btn-primary"
          onClick={() => setModalProjeto(true)}
        >
          <FaPlus />
          Novo Projeto
        </button>
      </div>

      <div className="ftth-cards">

        <div className="ftth-card primary">
          <span>Projetos</span>
          <strong>{totalProjetos}</strong>
        </div>

        <div className="ftth-card success">
          <span>CTOs Ativas</span>
          <strong>{totalCtos}</strong>
        </div>

        <div className="ftth-card warning">
          <span>Portas Livres</span>
          <strong>{portasLivres}</strong>
        </div>

        <div className="ftth-card danger">
          <span>Portas Ocupadas</span>
          <strong>{portasOcupadas}</strong>
        </div>

      </div>

      <div className="ftth-map-container">

        <MapContainer center={center as any} zoom={13} style={{ height: "100%", width: "100%" }}>

          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

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
                eventHandlers={{
                  click: () => carregarPortasCto(cto.id)
                }}
              >

                <Popup>

                  <b>{cto.nome}</b>
                  <br />
                  Total de portas: {cto.portas}

                  <hr />

                  <div style={{ maxHeight: 200, overflow: "auto" }}>

                    {portasCto[cto.id]?.map((porta: any) => (

                      <div key={porta.porta}>

                        <b>Porta {porta.porta}</b> —

                        {porta.ocupada ? (
                          <span style={{ color: "red" }}>
                            Ocupada ({porta.cliente?.nome})
                          </span>
                        ) : (
                          <span style={{ color: "green" }}>
                            Livre
                          </span>
                        )}

                      </div>

                    ))}

                  </div>

                </Popup>

              </Marker>
            );
          })}

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
                </Popup>

              </Marker>
            );
          })}

        </MapContainer>

      </div>

      
      {modalProjeto && (

  <div className="ftth-modal">

    <div className="ftth-modal-content">

      <div className="ftth-modal-header">
        <h3>Novo Projeto FTTH</h3>
        <button
          className="ftth-modal-close"
          onClick={() => setModalProjeto(false)}
        >
          ✕
        </button>
      </div>

      <div className="ftth-modal-form">

        <label>Nome do Projeto</label>
        <input
          value={nomeProjeto}
          onChange={(e) => setNomeProjeto(e.target.value)}
        />

        <label>Descrição</label>
        <input
          value={descricaoProjeto}
          onChange={(e) => setDescricaoProjeto(e.target.value)}
        />

      </div>

      <div className="ftth-modal-actions">

        <button
          className="ftth-btn-secondary"
          onClick={() => setModalProjeto(false)}
        >
          Cancelar
        </button>

        <button
          className="ftth-btn-primary"
          onClick={criarProjeto}
        >
          Salvar
        </button>

      </div>

    </div>

  </div>

)}
    </div>
  );
};

export default MapaFTTH;