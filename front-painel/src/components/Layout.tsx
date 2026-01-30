import Sidebar from "./Sidebar";
import Header from "./Header";
import "../styles/layout.css";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <Header />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
