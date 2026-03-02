import "../styles/layout.css";
import {
  FiBell,
  FiSun,
  FiMoon,
  FiMaximize,
  FiChevronDown,
  FiLogOut,
} from "react-icons/fi";
import { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const user = auth.currentUser;

  const displayName = useMemo(() => {
    return user?.displayName || user?.email || "Usuário";
  }, [user]);

  const roleLabel = useMemo(() => {
    // se quiser, depois a gente puxa isso do Firestore (empresa/usuarios/{uid})
    return "Administrador";
  }, []);

  const avatarLetter = useMemo(() => {
    const base = (user?.displayName || user?.email || "E").trim();
    return base[0]?.toUpperCase() || "E";
  }, [user]);

  // aplica tema no body
  useEffect(() => {
    if (darkMode) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  }, [darkMode]);

  // fecha o menu clicando fora
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!menuOpen) return;
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  // fullscreen real
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleLogout = async () => {
    try {
      setMenuOpen(false);
      await signOut(auth);

      // garante limpeza local (onIdTokenChanged também limpa)
      localStorage.removeItem("token");
      localStorage.removeItem("empresa_id");

      navigate("/", { replace: true });
    } catch (e) {
      console.error("Erro ao deslogar:", e);
      alert("Não foi possível sair. Tente novamente.");
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

        {/* PERFIL + MENU */}
        <div className="header-profile-wrap" ref={menuRef}>
          <button
            className="header-profile"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            title="Abrir menu do usuário"
          >
            <div className="profile-avatar">{avatarLetter}</div>

            <div className="profile-info">
              <strong className="profile-name">{displayName}</strong>
              <span>{roleLabel}</span>
            </div>

            <FiChevronDown className={`chevron ${menuOpen ? "open" : ""}`} />
          </button>

          {menuOpen && (
            <div className="profile-dropdown">
              <button className="dropdown-item logout" onClick={handleLogout}>
                <FiLogOut />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;