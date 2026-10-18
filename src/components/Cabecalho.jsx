import { Link, useNavigate } from "react-router-dom";

import { useSessao } from "../context/SessaoContext";

import logoFretarEscuro from "../assets/logo-fretar.png";
import logoFretarClaro from "../assets/logo-fretar-claro.png";

function Cabecalho({ tema, aoAlternarTema }) {
  const { logado, papel, sair } = useSessao();
  const navigate = useNavigate();

  const estaNoModoEscuro = tema === "escuro";

  function sairERedirecionar() {
    sair();
    navigate("/");
  }

  return (
    <header className="header">
      <Link className="logo" to="/" aria-label="Página inicial do Fretar">
        <img
          src={estaNoModoEscuro ? logoFretarEscuro : logoFretarClaro}
          alt="Fretar"
        />
      </Link>

      <nav className="menu" aria-label="Navegação principal">
        <Link to="/">Início</Link>
        {logado && <Link to="/mapa">Mapa</Link>}
        {papel === "user" && <Link to="/cliente">Meus fretes</Link>}
        {papel === "driver" && <Link to="/motorista">Ofertas</Link>}
        <a href="#como-funciona">Como funciona</a>
        <a href="#contato">Contato</a>
      </nav>

      <div className="acoes-header">
        <button
          className="botao-tema"
          type="button"
          onClick={aoAlternarTema}
          aria-label={
            estaNoModoEscuro ? "Ativar tema claro" : "Ativar tema escuro"
          }
          title={estaNoModoEscuro ? "Ativar tema claro" : "Ativar tema escuro"}
        >
          {estaNoModoEscuro ? "☀️" : "🌙"}
        </button>

        {logado ? (
          <button className="btn-entrar" type="button" onClick={sairERedirecionar}>
            Sair
          </button>
        ) : (
          <>
            <Link className="btn-entrar" to="/login">
              Entrar
            </Link>
            <Link className="btn-criar" to="/cadastro">
              Criar conta
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Cabecalho;
