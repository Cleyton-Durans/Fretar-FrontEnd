import logoFretarEscuro from '../assets/logo-fretar.png'
import logoFretarClaro from '../assets/logo-fretar-claro.png'

// CORREÇÃO 1: Adicionado onLogin e onCadastro aqui nos parâmetros
function Cabecalho({ tema, aoAlternarTema, onHistorico, onLogin, onCadastro }) {
  const estaNoModoEscuro = tema === 'escuro'

  return (
    <header className="header">

      <a
        className="logo"
        href="#inicio"
        aria-label="Página inicial do Fretar"
        onClick={(e) => {
          e.preventDefault()
          onLogin() // Se clicar no logo, volta para a tela inicial/login
        }}
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
        <a href="#inicio" onClick={(e) => { e.preventDefault(); onLogin(); }}>
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
          href="#historico"
          onClick={(e) => {
            e.preventDefault()
            onHistorico()
          }}
        >
          Meu histórico
        </a>

        {/* CORREÇÃO 2: Adicionado o onClick para interceptar o clique e ir para o Login */}
        <a
          className="btn-entrar"
          href="#login"
          onClick={(e) => {
            e.preventDefault()
            onLogin()
          }}
        >
          Entrar
        </a>

        {/* CORREÇÃO 3: Adicionado o onClick para interceptar o clique e ir para o Cadastro */}
        <a
          className="btn-criar"
          href="#cadastro"
          onClick={(e) => {
            e.preventDefault()
            onCadastro()
          }}
        >
          Criar conta
        </a>

      </div>

    </header>
  )
}

export default Cabecalho
