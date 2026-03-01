import { useState } from "react";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";


const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const navigate = useNavigate();


  return (
    <div className="login-page">
     <div className={`login-card ${isRegister ? "register-mode" : ""} ${isSwitching ? "switching" : ""}`}>

        {/* FORMULÁRIO */}
        <div className="form-container">
          {!isRegister ? (
  <>
    <h2>Login</h2>
    <p>Acesse sua conta</p>

    <input placeholder="E-mail" />
    <input placeholder="Senha" type="password" />

    <a className="forgot-password">Esqueceu sua senha?</a>

    <button
  className="login-button"
  onClick={() => navigate("/dashboard")}
>
  Entrar
</button>


    <div className="divider">
      <span>ou</span>
    </div>

    <div className="social-login">
   <button
  className="social-button google"
  onClick={async () => {
    try {
     const result = await signInWithPopup(auth, googleProvider);
const token = await result.user.getIdToken();

localStorage.setItem("token", token);

// 🔥 Chama backend para sincronizar usuário
const response = await fetch("http://localhost:8000/auth/sync-user", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`
  }
});

const data = await response.json();

// 🔥 SALVA EMPRESA_ID
localStorage.setItem("empresa_id", data.empresa_id);

navigate("/dashboard");
    } catch (error) {
      console.error("Erro login Google:", error);
      alert("Erro ao fazer login com Google");
    }
  }}
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
