import { useState } from "react";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";


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
      <button className="social-button google">
        <span>G</span>
      </button>

      <button className="social-button facebook">
        <span>f</span>
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
