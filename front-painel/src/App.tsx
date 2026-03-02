import { Routes, Route, Navigate } from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

// public
import Login from "./pages/public/Login";

// app
import Dashboard from "./pages/app/Dashboard";

// operação
import Clientes from "./pages/app/operacao/Clientes";
import Mensagens from "./pages/app/operacao/Mensagens";
import OrdensServico from "./pages/app/operacao/OrdensServico";

// financeiro
import Financeiro from "./pages/app/financeiro/Financeiro";
import Relatorios from "./pages/app/financeiro/Relatorios";

// rede
import Rede from "./pages/app/rede/Rede";

import Planos from "./pages/app/produtos/Planos";

// admin
import Configuracoes from "./pages/app/admin/Configuracoes";

function App() {
  const Protected = ({ children }: { children: React.ReactNode }) => (
    <PrivateRoute>
      <Layout>{children}</Layout>
    </PrivateRoute>
  );

  return (
    <Routes>
      {/* public */}
      <Route path="/" element={<Login />} />

      {/* app */}
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />

      {/* operação */}
      <Route path="/clientes" element={<Protected><Clientes /></Protected>} />
      <Route path="/mensagens" element={<Protected><Mensagens /></Protected>} />
      <Route path="/ordens-servico" element={<Protected><OrdensServico /></Protected>} />

      {/* financeiro */}
      <Route path="/financeiro" element={<Protected><Financeiro /></Protected>} />
      <Route path="/relatorios" element={<Protected><Relatorios /></Protected>} />

      {/* rede */}
      <Route path="/rede" element={<Protected><Rede /></Protected>} />


      <Route path="/planos" element={<Protected><Planos /></Protected>} />
      
      {/* admin */}
      <Route path="/configuracoes" element={<Protected><Configuracoes /></Protected>} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;