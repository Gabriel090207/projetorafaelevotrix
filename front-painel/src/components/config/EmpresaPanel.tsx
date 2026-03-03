import { useEffect, useState } from "react";
import "../../styles/empresa.css";

interface Empresa {
  id?: string;
  nome: string;
  plano?: string;
  status?: string;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
}

const EmpresaPanel = () => {
  const [form, setForm] = useState<Empresa>({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
  });

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [toast, setToast] = useState<{
    tipo: "sucesso" | "erro";
    mensagem: string;
  } | null>(null);

  const [erros, setErros] = useState<{ email?: string; cnpj?: string }>({});

  useEffect(() => {
    carregarEmpresa();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // =========================
  // CARREGAR EMPRESA
  // =========================
  async function carregarEmpresa() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/empresas/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      setForm({
        id: data.id,
        nome: data.nome ?? "",
        cnpj: data.cnpj ?? "",
        telefone: data.telefone ?? "",
        email: data.email ?? "",
        endereco: data.endereco ?? "",
        plano: data.plano,
        status: data.status,
      });
    } catch (error) {
      console.error("Erro ao carregar empresa:", error);
      setToast({ tipo: "erro", mensagem: "Erro ao carregar empresa." });
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // VALIDAÇÕES
  // =========================
  function validarEmail(email: string) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  function validarCNPJ(cnpj: string) {
    const cleaned = cnpj.replace(/\D/g, "");
    if (cleaned.length !== 14) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false;

    const calcularDigito = (base: string, pesos: number[]) => {
      let soma = 0;
      for (let i = 0; i < base.length; i++) {
        soma += Number(base[i]) * pesos[i];
      }
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const base12 = cleaned.slice(0, 12);
    const dig1 = calcularDigito(base12, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

    const base13 = base12 + String(dig1);
    const dig2 = calcularDigito(base13, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

    return cleaned === base12 + String(dig1) + String(dig2);
  }

  // =========================
  // MÁSCARAS
  // =========================
  function aplicarMascaraCNPJ(valor: string) {
    const cleaned = valor.replace(/\D/g, "").slice(0, 14);

    return cleaned
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  function aplicarMascaraTelefone(valor: string) {
    const cleaned = valor.replace(/\D/g, "").slice(0, 11);

    if (cleaned.length <= 10) {
      return cleaned
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return cleaned
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }

  // =========================
  // INPUT CHANGE
  // =========================
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.name as keyof Empresa;
    let value = e.target.value;

    if (name === "cnpj") value = aplicarMascaraCNPJ(value);
    if (name === "telefone") value = aplicarMascaraTelefone(value);

    const novoForm = { ...form, [name]: value };
    setForm(novoForm);

    const novosErros: { email?: string; cnpj?: string } = {};

    if (novoForm.email && !validarEmail(novoForm.email)) {
      novosErros.email = "Digite um e-mail válido.";
    }

    if (novoForm.cnpj && !validarCNPJ(novoForm.cnpj)) {
      novosErros.cnpj = "CNPJ inválido.";
    }

    setErros(novosErros);
  }

  const formularioInvalido =
    !!(form.email && !validarEmail(form.email)) ||
    !!(form.cnpj && !validarCNPJ(form.cnpj));

  // =========================
  // SALVAR EMPRESA
  // =========================
  async function salvarEmpresa() {
    if (formularioInvalido) {
      setToast({ tipo: "erro", mensagem: "Corrija os campos inválidos." });
      return;
    }

    try {
      setSalvando(true);

      const token = localStorage.getItem("token");

      await fetch(`${import.meta.env.VITE_API_URL}/empresas/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      setToast({
        tipo: "sucesso",
        mensagem: "Empresa atualizada com sucesso!",
      });
    } catch {
      setToast({
        tipo: "erro",
        mensagem: "Erro ao salvar empresa.",
      });
    } finally {
      setSalvando(false);
    }
  }

  // =========================
  // LOADING
  // =========================
  if (loading) return <p>Carregando empresa...</p>;

  return (
    <>
      {toast && (
        <div className="toast-wrapper">
          <div className={`toast ${toast.tipo}`}>{toast.mensagem}</div>
        </div>
      )}

      <div className="empresa-wrapper">
        <div className="empresa-panel">
          <div className="empresa-header">
            <div>
              <h2>Dados da Empresa</h2>
              <p>Gerencie as informações principais da sua organização.</p>
            </div>

            {form.status && (
              <span className={`empresa-status ${form.status}`}>
                {form.status}
              </span>
            )}
          </div>

          <div className="empresa-grid">
            <div className="empresa-field">
              <label>Nome da Empresa</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
              />
            </div>

            <div className="empresa-field">
              <label>CNPJ</label>
              <input
                name="cnpj"
                value={form.cnpj ?? ""}
                onChange={handleChange}
                className={erros.cnpj ? "input-error" : ""}
              />
              {erros.cnpj && <span className="erro-msg">{erros.cnpj}</span>}
            </div>

            <div className="empresa-field">
              <label>E-mail</label>
              <input
                name="email"
                value={form.email ?? ""}
                onChange={handleChange}
                className={erros.email ? "input-error" : ""}
              />
              {erros.email && <span className="erro-msg">{erros.email}</span>}
            </div>

            <div className="empresa-field">
              <label>Telefone</label>
              <input
                name="telefone"
                value={form.telefone ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="empresa-field full">
              <label>Endereço</label>
              <input
                name="endereco"
                value={form.endereco ?? ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="empresa-actions">
            <button
              className="btn-save"
              onClick={salvarEmpresa}
              disabled={salvando || formularioInvalido}
            >
              {salvando ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmpresaPanel;