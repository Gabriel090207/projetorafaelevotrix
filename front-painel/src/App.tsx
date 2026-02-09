import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Mensagens from "./pages/Mensagens";
import Financeiro from "./pages/Financeiro";
import Relatorios from "./pages/Relatorios";


import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />

      <Route
  path="/clientes"
  element={
    <Layout>
      <Clientes />
    </Layout>
  }
/>

<Route
  path="/mensagens"
  element={
    <Layout>
      <Mensagens />
    </Layout>
  }
/>

<Route
  path="/financeiro"
  element={
    <Layout>
      <Financeiro />
    </Layout>
  }
/>

<Route
  path="/relatorios"
  element={
    <Layout>
      <Relatorios />
    </Layout>
  }
/>
    </Routes>
  );
}

export default App;
