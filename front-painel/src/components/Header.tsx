import "../styles/layout.css";
import {
  FiBell,
  FiSun,
  FiMoon,
  FiMaximize,
  FiChevronDown,
} from "react-icons/fi";
import { useEffect, useState } from "react";

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);

  // aplica tema no body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  // fullscreen real
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <header className="header">
      {/* TÍTULO */}
      <h1 className="header-title">Dashboard</h1>

      {/* AÇÕES */}
      <div className="header-actions">
        {/* TEMA */}
        <button
          className="header-icon"
          title="Alternar tema"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>

        {/* FULLSCREEN */}
        <button
          className="header-icon"
          title="Tela cheia"
          onClick={toggleFullscreen}
        >
          <FiMaximize />
        </button>

        {/* NOTIFICAÇÕES */}
        <button className="header-icon notification" title="Notificações">
          <FiBell />
          <span className="notification-dot" />
        </button>

        {/* PERFIL */}
        <div className="header-profile">
          <div className="profile-avatar">E</div>

          <div className="profile-info">
            <strong>Eduardo</strong>
            <span>Administrador</span>
          </div>

          <FiChevronDown />
        </div>
      </div>
    </header>
  );
};

export default Header;
