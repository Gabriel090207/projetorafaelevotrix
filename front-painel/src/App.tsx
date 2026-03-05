import { Routes, Route, Navigate } from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

/* ================= PUBLIC ================= */

import Login from "./pages/public/Login";

/* ================= DASHBOARD ================= */

import Dashboard from "./pages/app/Dashboard";

/* ================= OPERAÇÃO ================= */

import Clientes from "./pages/app/operacao/Clientes";
import Mensagens from "./pages/app/operacao/Mensagens";
import OrdensServico from "./pages/app/operacao/OrdensServico";
import Contratos from "./pages/app/operacao/Contratos";

/* ================= FINANCEIRO ================= */

import Financeiro from "./pages/app/financeiro/Financeiro";
import Relatorios from "./pages/app/financeiro/Relatorios";
import Boletos from "./pages/app/financeiro/Boletos";
import ReguaCobranca from "./pages/app/financeiro/ReguaCobranca";

/* ================= REDE / NOC ================= */

import Rede from "./pages/app/rede/Rede";
import ClientesOnline from "./pages/app/rede/ClientesOnline";
import MapaFTTH from "./pages/app/rede/MapaFTTH";
import Ctos from "./pages/app/rede/Ctos";

/* novas páginas */

import Olts from "./pages/app/rede/Olts";
import Pons from "./pages/app/rede/Pons";
import Onus from "./pages/app/rede/Onus";

/* ================= PRODUTOS ================= */

import Planos from "./pages/app/produtos/Planos";
import Comodato from "./pages/app/produtos/Comodato";

/* ================= ADMIN ================= */

import Configuracoes from "./pages/app/admin/Configuracoes";

/* ================= CHATBOT ================= */

import Chatbot from "./pages/app/chatbot/Chatbot";


function App() {

  const Protected = ({ children }: { children: React.ReactNode }) => (
    <PrivateRoute>
      <Layout>{children}</Layout>
    </PrivateRoute>
  );

  return (
    <Routes>

      {/* ================= PUBLIC ================= */}

      <Route path="/" element={<Login />} />


      {/* ================= DASHBOARD ================= */}

      <Route
        path="/dashboard"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />


      {/* ================= OPERAÇÃO ================= */}

      <Route path="/clientes" element={<Protected><Clientes /></Protected>} />
      <Route path="/mensagens" element={<Protected><Mensagens /></Protected>} />
      <Route path="/ordens-servico" element={<Protected><OrdensServico /></Protected>} />
      <Route path="/contratos" element={<Protected><Contratos /></Protected>} />


      {/* ================= FINANCEIRO ================= */}

      <Route path="/financeiro" element={<Protected><Financeiro /></Protected>} />
      <Route path="/relatorios" element={<Protected><Relatorios /></Protected>} />
      <Route path="/boletos" element={<Protected><Boletos /></Protected>} />
      <Route path="/regua-cobranca" element={<Protected><ReguaCobranca /></Protected>} />


      {/* ================= REDE / NOC ================= */}

      <Route path="/rede" element={<Protected><Rede /></Protected>} />

      <Route path="/online" element={<Protected><ClientesOnline /></Protected>} />

      <Route path="/ftth" element={<Protected><MapaFTTH /></Protected>} />

      <Route path="/olts" element={<Protected><Olts /></Protected>} />

      <Route path="/pons" element={<Protected><Pons /></Protected>} />

      <Route path="/ctos" element={<Protected><Ctos /></Protected>} />

      <Route path="/onus" element={<Protected><Onus /></Protected>} />


      {/* ================= PRODUTOS ================= */}

      <Route path="/planos" element={<Protected><Planos /></Protected>} />
      <Route path="/comodato" element={<Protected><Comodato /></Protected>} />


      {/* ================= ADMIN ================= */}

      <Route path="/configuracoes" element={<Protected><Configuracoes /></Protected>} />


      {/* ================= CHATBOT ================= */}

      <Route path="/chatbot" element={<Protected><Chatbot /></Protected>} />


      {/* ================= FALLBACK ================= */}

      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  );
}

export default App;