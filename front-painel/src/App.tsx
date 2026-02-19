import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Mensagens from "./pages/Mensagens";
import Financeiro from "./pages/Financeiro";
import Relatorios from "./pages/Relatorios";
import Rede from "./pages/Rede";
import OrdensServico from "./pages/OrdensServico";
import Configuracoes from "./pages/Configuracoes";

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

      {/* 🔥 AGORA CORRIGIDO */}
      <Route
        path="/rede"
        element={
          <Layout>
            <Rede />
          </Layout>
        }
      />

      <Route
        path="/ordens-servico"
        element={
          <Layout>
            <OrdensServico />
          </Layout>
        }
      />

      <Route
        path="/configuracoes"
        element={
          <Layout>
            <Configuracoes />
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
