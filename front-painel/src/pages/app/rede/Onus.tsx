import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

import "../../../styles/onus.css";

import {
  FiSearch,
  FiPlus,
  FiMenu,
  FiEye,
  FiEdit
} from "react-icons/fi";

interface Onu {
  id: string;
  cliente: string;
  olt: string;
  pon: string;
  serial: string;
  rx: string;
  tx: string;
  status: string;
}

const Onus = () => {

  const [onus,setOnus] = useState<Onu[]>([]);
  const [busca,setBusca] = useState("");
  const [filtroOlt,setFiltroOlt] = useState("todos");
const [filtroStatus,setFiltroStatus] = useState("todos");
  const [openMenuId,setOpenMenuId] = useState<string | null>(null);

  async function carregarOnus(){

    try{

      const response = await api.get(`/onus`);

      setOnus(response.data);

    }catch(err){

      console.error("Erro ao carregar ONUs",err);

    }

  }

  useEffect(()=>{
    carregarOnus();
  },[]);


const onusFiltradas = useMemo(()=>{

  const termo = busca.toLowerCase();

  return onus.filter((o)=>{

    const matchBusca =
      !termo ||
      o.cliente?.toLowerCase().includes(termo) ||
      o.serial?.toLowerCase().includes(termo);

    const matchOlt =
      filtroOlt === "todos" ||
      o.olt?.toLowerCase() === filtroOlt.toLowerCase();

    const matchStatus =
      filtroStatus === "todos" ||
      o.status === filtroStatus;

    return matchBusca && matchOlt && matchStatus;

  });

},[onus,busca,filtroOlt,filtroStatus]);


  const totalOnline = onus.filter(o=>o.status === "online").length;
  const totalOffline = onus.filter(o=>o.status === "offline").length;


  return (

<div className="onus-page">

{/* HEADER */}

<div className="onus-header">

<h1>ONUs</h1>

<button className="btn-primary">
<FiPlus/>
Nova ONU
</button>

</div>


{/* CARDS */}

<div className="onus-cards">

<div className="onus-card primary">
<span>Total ONUs</span>
<strong>{onus.length}</strong>
</div>

<div className="onus-card success">
<span>Online</span>
<strong>{totalOnline}</strong>
</div>

<div className="onus-card warning">
<span>Offline</span>
<strong>{totalOffline}</strong>
</div>

</div>


{/* FILTROS */}


<div className="onus-filters">

  <div className="filter-group">
    <label>OLT</label>

    <select
      value={filtroOlt}
      onChange={(e)=>setFiltroOlt(e.target.value)}
    >
      <option value="todos">Todas</option>
      <option value="olt1">OLT 1</option>
      <option value="olt2">OLT 2</option>
    </select>
  </div>

  <div className="filter-group">
    <label>Status</label>

    <select
      value={filtroStatus}
      onChange={(e)=>setFiltroStatus(e.target.value)}
    >
      <option value="todos">Todos</option>
      <option value="online">Online</option>
      <option value="offline">Offline</option>
    </select>
  </div>

  <div className="filter-group search">
    <label>Buscar</label>

    <div className="search-input">
      <FiSearch/>

      <input
        placeholder="Buscar cliente ou serial..."
        value={busca}
        onChange={(e)=>setBusca(e.target.value)}
      />
    </div>
  </div>

</div>

{/* TABELA */}

<div className="onus-table-wrapper">

<table className="onus-table">

<thead>

<tr>
<th>Cliente</th>
<th>OLT</th>
<th>PON</th>
<th>Serial</th>
<th>RX</th>
<th>TX</th>
<th>Status</th>
<th>Ações</th>
</tr>

</thead>

<tbody>

{onusFiltradas.map((onu)=>(

<tr key={onu.id}>

<td>{onu.cliente}</td>

<td>{onu.olt}</td>

<td>{onu.pon}</td>

<td>{onu.serial}</td>

<td>{onu.rx}</td>

<td>{onu.tx}</td>

<td>
{onu.status === "online"
? "Online"
: "Offline"}
</td>

<td className="actions">

<div className="options-wrapper">

<button
className="options-button"
onClick={() =>
setOpenMenuId(openMenuId === onu.id ? null : onu.id)
}
>
<FiMenu/>
</button>

{openMenuId === onu.id && (

<div className="options-menu">

<div className="option-item">
<FiEye/> Detalhes
</div>

<div className="option-item">
<FiEdit/> Editar
</div>

</div>

)}

</div>

</td>

</tr>

))}

{onusFiltradas.length === 0 && (

<tr>
<td colSpan={8} style={{padding:16,opacity:0.7}}>
Nenhuma ONU encontrada.
</td>
</tr>

)}

</tbody>

</table>

</div>

</div>

);

};

export default Onus;