import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useSessao } from "../context/SessaoContext";

function Login() {
  const navigate = useNavigate();
  const localizacao = useLocation();
  const { entrar, logado, papel } = useSessao();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (logado) {
      navigate(papel === "driver" ? "/motorista" : "/cliente", {
        replace: true,
      });
    }
  }, [logado, papel, navigate]);

  async function handleLogin(event) {
    event.preventDefault();

    setCarregando(true);
    setMensagem("");

    try {
      const dados = await api("/auth/login", {
        metodo: "POST",
        corpo: { email, password: senha },
        comAuth: false,
      });

      entrar({ token: dados.token, usuario: dados.usuario });

      setTipoMensagem("sucesso");
      setMensagem("✓ Login realizado com sucesso!");

      const destinoPedido = localizacao.state?.de;
      const painel = dados.usuario?.tipo === "driver" ? "/motorista" : "/cliente";
      navigate(destinoPedido || painel, { replace: true });
    } catch (erro) {
      setTipoMensagem("erro");
      setMensagem(erro.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="cadastro-layout">
      <section className="cadastro-card">
        <div className="cadastro-titulo">
          <h2>Entrar</h2>
          <p>Faça login para acessar sua conta</p>
        </div>

        {mensagem && (
          <div className={`mensagem-cadastro ${tipoMensagem}`}>
            {mensagem}
          </div>
        )}

        <form className="cadastro-formulario" onSubmit={handleLogin}>
          <div className="linha-cadastro">
            <div className="campo-cadastro campo-grande">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="linha-cadastro">
            <div className="campo-cadastro campo-grande">
              <label htmlFor="senha">Senha</label>
              <input
                type="password"
                id="senha"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-cadastrar" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="login-link">
          <span>Não tem conta? </span>
          <Link to="/cadastro">Criar conta</Link>
        </div>

        <div className="login-link">
          <span>
            <small>Cliente: cliente@fretar.com / secret123</small>
          </span>
        </div>

        <div className="login-link">
          <span>
            <small>Motorista: motorista@fretar.com / secret123</small>
          </span>
        </div>
      </section>
    </main>
  );
}

export default Login;