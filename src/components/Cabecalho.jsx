import logoFretarEscuro from '../assets/logo-fretar.png'
import logoFretarClaro from '../assets/logo-fretar-claro.png'

function Cabecalho({ tema, aoAlternarTema }) {
  const estaNoModoEscuro = tema === 'escuro'

  return (
    <header className="header">

      <a
        className="logo"
        href="#inicio"
        aria-label="Página inicial do Fretar"
      >
        <img
          src={estaNoModoEscuro ? logoFretarEscuro : logoFretarClaro}
          alt="Fretar"
        />
      </a>

      <nav
        className="menu"
        aria-label="Navegação principal"
      >
        <a href="#inicio">
          Início
        </a>

        <a href="#como-funciona">
          Como funciona
        </a>

        <a href="#motoristas">
          Para motoristas
        </a>

        <a href="#seguranca">
          Segurança
        </a>

        <a href="#sobre">
          Sobre nós
        </a>

        <a href="#contato">
          Contato
        </a>
      </nav>

      <div className="acoes-header">

        <button
          className="botao-tema"
          type="button"
          onClick={aoAlternarTema}
          aria-label={
            estaNoModoEscuro
              ? 'Ativar tema claro'
              : 'Ativar tema escuro'
          }
          title={
            estaNoModoEscuro
              ? 'Ativar tema claro'
              : 'Ativar tema escuro'
          }
        >
          {estaNoModoEscuro ? '☀️' : '🌙'}
        </button>

        <a
          className="btn-entrar"
          href="#login"
        >
          Entrar
        </a>

        <a
          className="btn-criar"
          href="#cadastro"
        >
          Criar conta
        </a>

      </div>

    </header>
  )
}

export default Cabecalho