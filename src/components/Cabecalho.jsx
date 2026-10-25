
import logoFretarEscuro from '../assets/logo-fretar.png'
import logoFretarClaro from '../assets/logo-fretar-claro.png'

function Cabecalho({
  tema,
  aoAlternarTema,
  onLogin,
  onCadastro,
  onSecao
}) {
  const estaNoModoEscuro = tema === 'escuro'

  function tratarCliqueSecao(id, event) {
    if (onSecao) {
      onSecao(id, event)
    } else if (event) {
      event.preventDefault()
    }
  }

  return (
    <header className="header">
      <a
        className="logo"
        href="#inicio"
        aria-label="Página inicial do Fretar"
        onClick={(event) => tratarCliqueSecao('inicio', event)}
      >
        <img
          src={estaNoModoEscuro ? logoFretarEscuro : logoFretarClaro}
          alt="Fretar"
        />
      </a>

      <nav className="menu" aria-label="Navegação principal">
        <a
          href="#inicio"
          onClick={(event) => tratarCliqueSecao('inicio', event)}
        >
          Início
        </a>

        <a
          href="#como-funciona"
          onClick={(event) => tratarCliqueSecao('como-funciona', event)}
        >
          Como funciona
        </a>

        <a
          href="#motoristas"
          onClick={(event) => tratarCliqueSecao('motoristas', event)}
        >
          Para motoristas
        </a>

        <a
          href="#seguranca"
          onClick={(event) => tratarCliqueSecao('seguranca', event)}
        >
          Segurança
        </a>

        <a
          href="#sobre"
          onClick={(event) => tratarCliqueSecao('sobre', event)}
        >
          Sobre nós
        </a>

        <a
          href="#contato"
          onClick={(event) => tratarCliqueSecao('contato', event)}
        >
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
          onClick={onLogin}
        >
          Entrar
        </a>

        <a
          className="btn-criar"
          href="#cadastro"
          onClick={onCadastro}
        >
          Criar conta
        </a>
      </div>
    </header>
  )
}

export default Cabecalho
