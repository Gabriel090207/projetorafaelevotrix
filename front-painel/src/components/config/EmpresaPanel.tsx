import { useEffect, useState } from "react";
import "../../styles/empresa.css";

interface Empresa {
  nome: string;
  plano: string;
  status: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
}

const EmpresaPanel = () => {
  const [form, setForm] = useState<Empresa | null>(null);
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

  async function carregarEmpresa() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8000/empresas/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setForm(data);
    } catch (error) {
      console.error("Erro ao carregar empresa:", error);
    } finally {
      setLoading(false);
    }
  }

  function validarEmail(email: string) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email)) return false;

    const dominio = email.split("@")[1];
    if (!dominio || !dominio.includes(".")) return false;

    return true;
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
      return cleaned.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
    }

    return cleaned.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!form) return;

    const name = e.target.name as keyof Empresa;
    let value = e.target.value;

    if (name === "cnpj") value = aplicarMascaraCNPJ(value);
    if (name === "telefone") value = aplicarMascaraTelefone(value);

    const novoForm: Empresa = { ...form, [name]: value };
    setForm(novoForm);

    const novosErros: { email?: string; cnpj?: string } = {};

    if (novoForm.email && !validarEmail(novoForm.email)) {
      novosErros.email = "Digite um e-mail válido (ex: contato@empresa.com)";
    }
    if (novoForm.cnpj && !validarCNPJ(novoForm.cnpj)) {
      novosErros.cnpj = "CNPJ inválido.";
    }

    setErros(novosErros);
  }

  // ✅ fica declarado antes do return (evita erro no disabled)
  const formularioInvalido =
    !!(form?.email && !validarEmail(form.email)) ||
    !!(form?.cnpj && !validarCNPJ(form.cnpj));

  async function salvarEmpresa() {
    if (!form || formularioInvalido) {
      setToast({ tipo: "erro", mensagem: "Corrija os campos inválidos." });
      return;
    }

    try {
      setSalvando(true);
      const token = localStorage.getItem("token");

      await fetch("http://localhost:8000/empresas/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      setToast({ tipo: "sucesso", mensagem: "Empresa atualizada com sucesso!" });
    } catch {
      setToast({ tipo: "erro", mensagem: "Erro ao salvar empresa." });
    } finally {
      setSalvando(false);
    }
  }

  if (loading) return <p>Carregando...</p>;
  if (!form) return <p>Empresa não encontrada.</p>;

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

            <span className={`empresa-status ${form.status}`}>{form.status}</span>
          </div>

          <div className="empresa-grid">
            <div className="empresa-field">
              <label>Nome da Empresa</label>
              <input name="nome" value={form.nome || ""} onChange={handleChange} />
            </div>

            <div className="empresa-field">
              <label>CNPJ</label>
              <input
                name="cnpj"
                value={form.cnpj || ""}
                onChange={handleChange}
                className={erros.cnpj ? "input-error" : ""}
              />
              {erros.cnpj && <span className="erro-msg">{erros.cnpj}</span>}
            </div>

            <div className="empresa-field">
              <label>E-mail</label>
              <input
                name="email"
                value={form.email || ""}
                onChange={handleChange}
                className={erros.email ? "input-error" : ""}
              />
              {erros.email && <span className="erro-msg">{erros.email}</span>}
            </div>

            <div className="empresa-field">
              <label>Telefone</label>
              <input name="telefone" value={form.telefone || ""} onChange={handleChange} />
            </div>

            <div className="empresa-field full">
              <label>Endereço</label>
              <input name="endereco" value={form.endereco || ""} onChange={handleChange} />
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