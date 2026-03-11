import { useState } from "react";
import "../../styles/login.css";
import { useNavigate } from "react-router-dom";

import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../../services/firebase";

const Login = () => {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [isRegister, setIsRegister] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const navigate = useNavigate();

  // =========================
  // LOGIN EMAIL / SENHA
  // =========================

  async function loginEmail() {
    try {

      const result = await signInWithEmailAndPassword(auth, email, senha);

      const token = await result.user.getIdToken();

      localStorage.setItem("token", token);

     const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

      const data = await response.json();

      localStorage.setItem("empresa_id", data.empresa_id);
localStorage.setItem("perfil", data.perfil);

// salvar cliente
if (data.cliente_id) {
  localStorage.setItem("cliente_id", data.cliente_id);
}

      redirecionar(data.perfil);

    } catch (error) {
      console.error(error);
      alert("Erro ao fazer login");
    }
  }

  // =========================
  // LOGIN GOOGLE
  // =========================

  async function loginGoogle() {
    try {

      const result = await signInWithPopup(auth, googleProvider);

      const token = await result.user.getIdToken();

      localStorage.setItem("token", token);

      localStorage.setItem(
        "user",
        JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL
        })
      );

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

      const data = await response.json();

     localStorage.setItem("empresa_id", data.empresa_id);
localStorage.setItem("perfil", data.perfil);
localStorage.setItem("uid", data.uid);

localStorage.setItem("cliente_id", data.uid);

// salvar cliente
if (data.cliente_id) {
  localStorage.setItem("cliente_id", data.cliente_id);
}

      redirecionar(data.perfil);

    } catch (error) {
      console.error("Erro login Google:", error);
      alert("Erro ao fazer login com Google");
    }
  }

  // =========================
  // REDIRECIONAMENTO
  // =========================

  function redirecionar(perfil: string) {

  setIsRegister(false);
  setIsSwitching(false);

  if (perfil === "admin") {
    navigate("/dashboard");
  }

  if (perfil === "cliente") {
    navigate("/cliente/dashboard");
  }

  if (perfil === "tecnico") {
    navigate("/tecnico/dashboard");
  }

}

  return (
    <div className="login-page">

      <div className={`login-card ${isRegister ? "register-mode" : ""} ${isSwitching ? "switching" : ""}`}>

        <div className="form-container">

          {!isRegister ? (
            <>
              <h2>Login</h2>
              <p>Acesse sua conta</p>

              <input
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                placeholder="Senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />

              <a className="forgot-password">Esqueceu sua senha?</a>

              <button
                className="login-button"
                onClick={loginEmail}
              >
                Entrar
              </button>

              <div className="divider">
                <span>ou</span>
              </div>

              <div className="social-login">

                <button
                  className="social-button google"
                  onClick={loginGoogle}
                >
                  <span>G</span>
                </button>

              </div>
            </>
          ) : (
            <>
              <h2>Criar conta</h2>
              <p>Preencha os dados abaixo</p>

              <input placeholder="Nome" />
              <input placeholder="E-mail" />
              <input placeholder="Senha" type="password" />

              <button className="login-button">Cadastrar</button>
            </>
          )}

        </div>

        {/* PAINEL VERMELHO */}

        <div className="overlay-container">

          {!isRegister ? (
            <>
              <h1>Bem-vindo!</h1>

              <p>
                Nossa missão é simplificar,
                <br />
                automatizar e integrar.
              </p>

              <button
                className="ghost-button"
                onClick={() => {
                  setIsSwitching(true);
                  setTimeout(() => {
                    setIsRegister(true);
                    setIsSwitching(false);
                  }, 450);
                }}
              >
                Cadastre-se
              </button>
            </>
          ) : (
            <>
              <h1>Bem-vindo de volta!</h1>

              <p>
                Já possui uma conta?
                <br />
                Faça login para continuar.
              </p>

              <button
                className="ghost-button"
                onClick={() => {
                  setIsSwitching(true);
                  setTimeout(() => {
                    setIsRegister(false);
                    setIsSwitching(false);
                  }, 450);
                }}
              >
                Login
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default Login;