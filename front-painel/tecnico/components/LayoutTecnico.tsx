import SidebarTecnico from "./SidebarTecnico";
import Header from "../../src/components/Header";
import "../styles/layout.css";

const LayoutTecnico = ({ children }: any) => {
  return (
    <div className="tecnico-layout">
      <SidebarTecnico />

      <div className="tecnico-app-content">
        <Header />
        <main className="tecnico-page-content">{children}</main>
      </div>
    </div>
  );
};

export default LayoutTecnico;