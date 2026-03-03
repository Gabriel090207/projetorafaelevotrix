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
import api from "../services/api";

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [empresaNome, setEmpresaNome] = useState("Carregando...");

  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const firebaseUser = auth.currentUser;

// 🔥 tenta pegar usuário do cache
const cachedUser = JSON.parse(localStorage.getItem("user") || "null");

const user = firebaseUser || cachedUser;

  const displayName = useMemo(() => {
  return (
    user?.displayName ||
    user?.name ||
    user?.email ||
    "Usuário"
  );
}, [user]);

  const avatarLetter = useMemo(() => {
  const base = (
    user?.displayName ||
    user?.name ||
    user?.email ||
    "E"
  ).trim();

  return base[0]?.toUpperCase() || "E";
}, [user]);

  // =============================
  // BUSCAR EMPRESA LOGADA
  // =============================
  useEffect(() => {
    async function carregarUsuario() {
      try {
        const response = await api.get("/auth/me");

        setEmpresaNome(response.data.empresa_nome);

        localStorage.setItem("empresa_id", response.data.empresa_id);
        localStorage.setItem("perfil", response.data.perfil);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        setEmpresaNome("Empresa");
      }
    }

    carregarUsuario();
  }, []);

  // =============================
  // DARK MODE
  // =============================
  useEffect(() => {
    if (darkMode) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  }, [darkMode]);

  // =============================
  // FECHAR MENU CLICANDO FORA
  // =============================
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

  // =============================
  // FULLSCREEN
  // =============================
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // =============================
  // LOGOUT
  // =============================
  const handleLogout = async () => {
    try {
      setMenuOpen(false);
      await signOut(auth);

      localStorage.removeItem("token");
      localStorage.removeItem("empresa_id");
      localStorage.removeItem("perfil");

      navigate("/", { replace: true });
    } catch (e) {
      console.error("Erro ao deslogar:", e);
      alert("Não foi possível sair. Tente novamente.");
    }
  };

  return (
    <header className="header">
      {/* EMPRESA */}
      <h1 className="header-title">{empresaNome}</h1>

      {/* AÇÕES */}
      <div className="header-actions">
        <button
          className="header-icon"
          title="Alternar tema"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>

        <button
          className="header-icon"
          title="Tela cheia"
          onClick={toggleFullscreen}
        >
          <FiMaximize />
        </button>

        <button className="header-icon notification" title="Notificações">
          <FiBell />
          <span className="notification-dot" />
        </button>

        {/* PERFIL */}
        <div className="header-profile-wrap" ref={menuRef}>
          <button
            className="header-profile"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
          >
            <div className="profile-avatar">{avatarLetter}</div>

            <div className="profile-info">
              <strong className="profile-name">{displayName}</strong>
              <span>Administrador</span>
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