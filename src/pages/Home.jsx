
import './Home.css'

function Home({ onLogin, onCadastro }) {
  return (
    <main className="fretar-home">
      <section id="inicio" className="home-hero">
        <div className="home-hero-conteudo">
          <span className="home-etiqueta">
            CONECTANDO QUEM PRECISA A QUEM TRANSPORTA
          </span>

          <h1>
            Seu frete, de um jeito
            <span> mais simples.</span>
          </h1>

          <p>
            O Fretar é uma plataforma pensada para aproximar
            clientes que precisam transportar mercadorias e
            profissionais que realizam serviços de frete.
          </p>

          <div className="home-botoes">
            <button
              type="button"
              className="home-botao-principal"
              onClick={onCadastro}
            >
              Criar minha conta
            </button>

            <button
              type="button"
              className="home-botao-secundario"
              onClick={onLogin}
            >
              Já tenho conta
            </button>
          </div>

          <p className="home-aviso">
            Plataforma em desenvolvimento. A disponibilidade
            dos serviços depende das funcionalidades implementadas.
          </p>
        </div>

        <div className="home-hero-visual" aria-hidden="true">
          <div className="home-visual-circulo">
            <span className="home-visual-icone">F</span>
          </div>
          <div className="home-visual-cartao">
            <span className="home-visual-ponto" />
            <div>
              <strong>Cliente</strong>
              <small>Precisa transportar</small>
            </div>
            <span className="home-visual-seta">→</span>
            <div>
              <strong>Freteiro</strong>
              <small>Realiza o transporte</small>
            </div>
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="home-secao home-como-funciona"
      >
        <div className="home-secao-cabecalho">
          <span className="home-etiqueta">COMO FUNCIONA</span>
          <h2>Frete com uma jornada mais simples</h2>
          <p>
            A proposta do Fretar é facilitar o contato entre
            quem precisa transportar e quem oferece o serviço.
          </p>
        </div>

        <div className="home-grade">
          <article className="home-card">
            <span className="home-card-numero">01</span>
            <h3>Crie sua conta</h3>
            <p>
              Escolha o tipo de cadastro adequado ao seu perfil:
              cliente ou freteiro.
            </p>
          </article>

          <article className="home-card">
            <span className="home-card-numero">02</span>
            <h3>Informe sua necessidade</h3>
            <p>
              A proposta é permitir que o cliente informe os
              detalhes do transporte de que precisa.
            </p>
          </article>

          <article className="home-card">
            <span className="home-card-numero">03</span>
            <h3>Conecte-se</h3>
            <p>
              A plataforma pretende aproximar clientes e
              profissionais para facilitar a contratação do frete.
            </p>
          </article>
        </div>
      </section>

      <section id="motoristas" className="home-secao home-motoristas">
        <div className="home-bloco-destaque">
          <div>
            <span className="home-etiqueta">PARA FRETEIROS</span>
            <h2>Seu trabalho também tem espaço aqui.</h2>
            <p>
              O Fretar foi pensado para aproximar profissionais
              de transporte de pessoas que precisam movimentar
              suas mercadorias.
            </p>
            <ul className="home-lista">
              <li>Crie seu cadastro profissional.</li>
              <li>Informe os dados solicitados sobre seu veículo.</li>
              <li>Prepare-se para as funcionalidades de conexão de fretes.</li>
            </ul>
          </div>

          <div className="home-motoristas-icone" aria-hidden="true">
            <span>F</span>
            <small>FRETAR</small>
          </div>
        </div>

        <div className="home-botoes">
          <button
            type="button"
            className="home-botao-principal"
            onClick={onCadastro}
          >
            Quero me cadastrar
          </button>
        </div>
      </section>

      <section id="seguranca" className="home-secao home-seguranca">
        <div className="home-secao-cabecalho">
          <span className="home-etiqueta">SEGURANÇA</span>
          <h2>Confiança começa com informação clara</h2>
          <p>
            O uso responsável da plataforma depende de dados
            corretos, cuidado com as credenciais e respeito às
            regras aplicáveis.
          </p>
        </div>

        <div className="home-grade home-grade-dois">
          <article className="home-card">
            <h3>Proteja sua conta</h3>
            <p>
              Utilize uma senha segura e não compartilhe suas
              credenciais com outras pessoas.
            </p>
          </article>

          <article className="home-card">
            <h3>Mantenha os dados corretos</h3>
            <p>
              Informe dados verdadeiros e atualizados durante
              o cadastro e o uso dos serviços.
            </p>
          </article>
        </div>

        <p className="home-nota">
          Os recursos de verificação, proteção e acompanhamento
          dependerão da implementação efetiva do sistema.
        </p>
      </section>

      <section id="sobre" className="home-secao home-sobre">
        <div className="home-sobre-marca" aria-hidden="true">
          FRETAR<span>.</span>
        </div>

        <div className="home-sobre-texto">
          <span className="home-etiqueta">SOBRE NÓS</span>
          <h2>Uma proposta para aproximar pessoas e transportadores.</h2>
          <p>
            O Fretar é um projeto de plataforma digital voltado
            à conexão entre clientes que precisam de frete e
            profissionais que oferecem serviços de transporte.
          </p>
          <p>
            Nosso objetivo é organizar essa experiência em um
            ambiente simples de usar, com cadastro separado para
            clientes e freteiros e espaço para evoluir novas
            funcionalidades.
          </p>
        </div>
      </section>

      <section id="contato" className="home-secao home-contato">
        <span className="home-etiqueta">CONTATO E ACESSO</span>
        <h2>Vamos começar?</h2>
        <p>
          Crie sua conta para conhecer as etapas disponíveis
          no projeto ou entre se você já possui cadastro.
        </p>

        <div className="home-botoes home-botoes-centro">
          <button
            type="button"
            className="home-botao-principal"
            onClick={onCadastro}
          >
            Criar conta
          </button>

          <button
            type="button"
            className="home-botao-secundario"
            onClick={onLogin}
          >
            Entrar
          </button>
        </div>
      </section>
    </main>
  )
}

export default Home
