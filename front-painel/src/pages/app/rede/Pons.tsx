import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

import "../../../styles/pons.css";

import {
  FiSearch,
  FiPlus,
  FiMenu,
  FiEye,
  FiEdit
} from "react-icons/fi";

interface Pon {
  id: string;
  nome: string;
  olt: string;
  porta: string;
  ctos: number;
  status: string;
}

const Pons = () => {

  const [pons,setPons] = useState<Pon[]>([]);
  const [busca,setBusca] = useState("");
  const [filtroOlt,setFiltroOlt] = useState("todos");
const [filtroStatus,setFiltroStatus] = useState("todos");
  const [openMenuId,setOpenMenuId] = useState<string | null>(null);

  async function carregarPons(){

    try{

      const response = await api.get(`/pons`);

      setPons(response.data);

    }catch(err){

      console.error("Erro ao carregar PONs",err);

    }

  }

  useEffect(()=>{
    carregarPons();
  },[]);


const ponsFiltradas = useMemo(()=>{

  const termo = busca.toLowerCase();

  return pons.filter((p)=>{

    const matchBusca =
      !termo ||
      p.nome?.toLowerCase().includes(termo) ||
      p.olt?.toLowerCase().includes(termo);

    const matchOlt =
      filtroOlt === "todos" ||
      p.olt?.toLowerCase() === filtroOlt.toLowerCase();

    const matchStatus =
      filtroStatus === "todos" ||
      p.status === filtroStatus;

    return matchBusca && matchOlt && matchStatus;

  });

},[pons,busca,filtroOlt,filtroStatus]);


  const totalCtos = pons.reduce((acc,p)=> acc + (p.ctos || 0),0);

  const totalOnline = pons.filter(p=>p.status === "online").length;


  return (

<div className="pons-page">

{/* HEADER */}

<div className="pons-header">

<h1>PONs</h1>

<button className="btn-primary">
<FiPlus/>
Nova PON
</button>

</div>


{/* CARDS */}

<div className="pons-cards">

<div className="pons-card primary">
<span>Total PONs</span>
<strong>{pons.length}</strong>
</div>

<div className="pons-card success">
<span>Total CTOs</span>
<strong>{totalCtos}</strong>
</div>

<div className="pons-card warning">
<span>Online</span>
<strong>{totalOnline}</strong>
</div>

</div>


{/* FILTRO */}

<div className="pons-filters">

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
        placeholder="Buscar PON..."
        value={busca}
        onChange={(e)=>setBusca(e.target.value)}
      />

    </div>

  </div>

</div>


{/* TABELA */}

<div className="pons-table-wrapper">

<table className="pons-table">

<thead>

<tr>
<th>Nome</th>
<th>OLT</th>
<th>Porta</th>
<th>CTOs</th>
<th>Status</th>
<th>Ações</th>
</tr>

</thead>

<tbody>

{ponsFiltradas.map((pon)=>(

<tr key={pon.id}>

<td>{pon.nome}</td>

<td>{pon.olt}</td>

<td>{pon.porta}</td>

<td>{pon.ctos}</td>

<td>
{pon.status === "online"
? "Online"
: "Offline"}
</td>

<td className="actions">

<div className="options-wrapper">

<button
className="options-button"
onClick={() =>
setOpenMenuId(openMenuId === pon.id ? null : pon.id)
}
>
<FiMenu/>
</button>

{openMenuId === pon.id && (

<div className="options-menu">

<div className="option-item">
<FiEye/> Ver CTOs
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

{ponsFiltradas.length === 0 && (

<tr>
<td colSpan={6} style={{padding:16,opacity:0.7}}>
Nenhuma PON encontrada.
</td>
</tr>

)}

</tbody>

</table>

</div>

</div>

);

};

export default Pons;