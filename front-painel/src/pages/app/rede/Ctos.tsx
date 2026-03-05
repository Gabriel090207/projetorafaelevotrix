import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

import "../../../styles/ctos.css";

import {
  FiSearch,
  FiPlus,
  FiMenu,
  FiEye,
  FiEdit
} from "react-icons/fi";

interface Cto {
  id: string;
  nome: string;
  portas: number;
  latitude?: number;
  longitude?: number;
}

const Ctos = () => {

  const [ctos,setCtos] = useState<Cto[]>([]);
  const [busca,setBusca] = useState("");
  const [filtroProjeto,setFiltroProjeto] = useState("todos");
  const [filtroPon,setFiltroPon] = useState("todos");

  const [openMenuId,setOpenMenuId] = useState<string | null>(null);

  async function carregarCtos(){

    try{

      const response = await api.get(`/ctos`);

      setCtos(response.data);

    }catch(err){

      console.error("Erro ao carregar CTOs",err);

    }

  }

  useEffect(()=>{
    carregarCtos();
  },[]);


  const ctosFiltradas = useMemo(()=>{

    const termo = busca.toLowerCase();

    return ctos.filter((c)=>{

      const matchBusca =
        !termo ||
        c.nome?.toLowerCase().includes(termo);

      return matchBusca;

    });

  },[ctos,busca]);


  const totalPortas = ctos.reduce((acc,c)=> acc + (c.portas || 0),0);

  const mediaPortas =
    ctos.length > 0
      ? Math.round(totalPortas / ctos.length)
      : 0;


  return (

<div className="ctos-page">

{/* HEADER */}

<div className="ctos-header">

<h1>CTOs</h1>

<button className="btn-primary">
<FiPlus/>
Nova CTO
</button>

</div>


{/* CARDS */}

<div className="ctos-cards">

<div className="ctos-card primary">
<span>Total CTOs</span>
<strong>{ctos.length}</strong>
</div>

<div className="ctos-card success">
<span>Total Portas</span>
<strong>{totalPortas}</strong>
</div>

<div className="ctos-card warning">
<span>Média de Portas</span>
<strong>{mediaPortas}</strong>
</div>

</div>


{/* FILTROS */}

<div className="ctos-filters">

<div className="filter-group">

<label>Projeto</label>

<select
value={filtroProjeto}
onChange={(e)=>setFiltroProjeto(e.target.value)}
>

<option value="todos">Todos</option>
<option value="centro">Centro</option>
<option value="zona-norte">Zona Norte</option>

</select>

</div>


<div className="filter-group">

<label>PON</label>

<select
value={filtroPon}
onChange={(e)=>setFiltroPon(e.target.value)}
>

<option value="todos">Todas</option>
<option value="pon1">PON 1</option>
<option value="pon2">PON 2</option>

</select>

</div>


<div className="filter-group search">

<label>Buscar</label>

<div className="search-input">

<FiSearch/>

<input
placeholder="Buscar CTO..."
value={busca}
onChange={(e)=>setBusca(e.target.value)}
/>

</div>

</div>

</div>


{/* TABELA */}

<div className="ctos-table-wrapper">

<table className="ctos-table">

<thead>

<tr>
<th>Nome</th>
<th>Portas</th>
<th>Latitude</th>
<th>Longitude</th>
<th>Ações</th>
</tr>

</thead>

<tbody>

{ctosFiltradas.map((cto)=>(
<tr key={cto.id}>

<td>{cto.nome}</td>

<td>{cto.portas}</td>

<td>{cto.latitude || "-"}</td>

<td>{cto.longitude || "-"}</td>

<td className="actions">

<div className="options-wrapper">

<button
className="options-button"
onClick={() =>
setOpenMenuId(openMenuId === cto.id ? null : cto.id)
}
>
<FiMenu/>
</button>

{openMenuId === cto.id && (

<div className="options-menu">

<div className="option-item">
<FiEye/> Ver portas
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

{ctosFiltradas.length === 0 && (

<tr>
<td colSpan={5} style={{padding:16,opacity:0.7}}>
Nenhuma CTO encontrada.
</td>
</tr>

)}

</tbody>

</table>

</div>

</div>

);

};

export default Ctos;