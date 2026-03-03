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
import Contratos from "./pages/app/operacao/Contratos";

// financeiro
import Financeiro from "./pages/app/financeiro/Financeiro";
import Relatorios from "./pages/app/financeiro/Relatorios";
import Boletos from "./pages/app/financeiro/Boletos";
import ReguaCobranca from "./pages/app/financeiro/ReguaCobranca";

// rede
import Rede from "./pages/app/rede/Rede";
import ClientesOnline from "./pages/app/rede/ClientesOnline";
import MapaFTTH from "./pages/app/rede/MapaFTTH";


//produtos
import Planos from "./pages/app/produtos/Planos";
import Comodato from "./pages/app/produtos/Comodato";

// admin
import Configuracoes from "./pages/app/admin/Configuracoes";

import Chatbot from "./pages/app/chatbot/Chatbot";

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
      <Route path="/contratos" element={<Protected><Contratos /></Protected>} />

      {/* financeiro */}
      <Route path="/financeiro" element={<Protected><Financeiro /></Protected>} />
      <Route path="/relatorios" element={<Protected><Relatorios /></Protected>} />
      <Route path="/boletos" element={<Protected><Boletos /></Protected>} />
<Route path="/regua-cobranca" element={<Protected><ReguaCobranca /></Protected>} />

      {/* rede */}
      <Route path="/rede" element={<Protected><Rede /></Protected>} />
      <Route path="/online" element={<Protected><ClientesOnline /></Protected>} />
      <Route path="/ftth" element={<Protected><MapaFTTH /></Protected>} />


       {/* produtos */}
      <Route path="/planos" element={<Protected><Planos /></Protected>} />
      <Route path="/comodato" element={<Protected><Comodato /></Protected>} />
      
      
      {/* admin */}
      <Route path="/configuracoes" element={<Protected><Configuracoes /></Protected>} />
     

      <Route path="/chatbot" element={<Protected><Chatbot /></Protected>} />
      {/* fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;