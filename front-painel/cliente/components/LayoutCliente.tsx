import SidebarCliente from "./SidebarCliente";
import Header from "../../src/components/Header";
import "../../src/styles/layout.css";

const LayoutCliente = ({ children }: any) => {
  return (
    <div className="app-layout">

      <SidebarCliente />

      <div className="app-content">

        <Header />

        <main className="page-content">
          {children}
        </main>

      </div>

    </div>
  );
};

export default LayoutCliente;