import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

import "../../../styles/olts.css";

import {
  FiSearch,
  FiPlus,
  FiMenu,
  FiEye,
  FiEdit
} from "react-icons/fi";

interface Olt {
  id: string;
  nome: string;
  ip: string;
  modelo: string;
  pons: number;
  status: string;
}

const Olts = () => {

  const [olts,setOlts] = useState<Olt[]>([]);
  const [busca,setBusca] = useState("");
  const [filtroModelo,setFiltroModelo] = useState("todos");
const [filtroStatus,setFiltroStatus] = useState("todos");
  const [openMenuId,setOpenMenuId] = useState<string | null>(null);

  async function carregarOlts(){

    try{

      const response = await api.get(`/olts`);

      setOlts(response.data);

    }catch(err){

      console.error("Erro ao carregar OLTs",err);

    }

  }

  useEffect(()=>{
    carregarOlts();
  },[]);


 const oltsFiltradas = useMemo(()=>{

  const termo = busca.toLowerCase();

  return olts.filter((o)=>{

    const matchBusca =
      !termo ||
      o.nome?.toLowerCase().includes(termo) ||
      o.ip?.toLowerCase().includes(termo);

    const matchModelo =
      filtroModelo === "todos" ||
      o.modelo?.toLowerCase() === filtroModelo.toLowerCase();

    const matchStatus =
      filtroStatus === "todos" ||
      o.status === filtroStatus;

    return matchBusca && matchModelo && matchStatus;

  });

},[olts,busca,filtroModelo,filtroStatus]);

  const totalPons = olts.reduce((acc,o)=> acc + (o.pons || 0),0);

  const totalOnline = olts.filter(o=>o.status === "online").length;


  return (

<div className="olts-page">


{/* HEADER */}

<div className="olts-header">

<h1>OLTs</h1>

<button className="btn-primary">
<FiPlus/>
Nova OLT
</button>

</div>


{/* CARDS */}

<div className="olts-cards">

<div className="olts-card primary">
<span>Total OLTs</span>
<strong>{olts.length}</strong>
</div>

<div className="olts-card success">
<span>Total PONs</span>
<strong>{totalPons}</strong>
</div>

<div className="olts-card warning">
<span>Online</span>
<strong>{totalOnline}</strong>
</div>

</div>


{/* FILTROS */}

<div className="olts-filters">

  <div className="filter-group">
    <label>Modelo</label>

    <select
      value={filtroModelo}
      onChange={(e)=>setFiltroModelo(e.target.value)}
    >
      <option value="todos">Todos</option>
      <option value="zte">ZTE</option>
      <option value="huawei">Huawei</option>
      <option value="fiberhome">Fiberhome</option>
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
        placeholder="Buscar OLT..."
        value={busca}
        onChange={(e)=>setBusca(e.target.value)}
      />

    </div>

  </div>

</div>


{/* TABELA */}

<div className="olts-table-wrapper">

<table className="olts-table">

<thead>

<tr>
<th>Nome</th>
<th>IP</th>
<th>Modelo</th>
<th>PONs</th>
<th>Status</th>
<th>Ações</th>
</tr>

</thead>

<tbody>

{oltsFiltradas.map((olt)=>(

<tr key={olt.id}>

<td>{olt.nome}</td>

<td>{olt.ip}</td>

<td>{olt.modelo}</td>

<td>{olt.pons}</td>

<td>
{olt.status === "online"
? "Online"
: "Offline"}
</td>

<td className="actions">

<div className="options-wrapper">

<button
className="options-button"
onClick={() =>
setOpenMenuId(openMenuId === olt.id ? null : olt.id)
}
>
<FiMenu/>
</button>

{openMenuId === olt.id && (

<div className="options-menu">

<div className="option-item">
<FiEye/> Ver PONs
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

{oltsFiltradas.length === 0 && (

<tr>
<td colSpan={6} style={{padding:16,opacity:0.7}}>
Nenhuma OLT encontrada.
</td>
</tr>

)}

</tbody>

</table>

</div>

</div>

);

};

export default Olts;