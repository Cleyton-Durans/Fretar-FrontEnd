import { Link } from "react-router-dom";

function Contato() {
  return (
    <main className="pagina-institucional-layout">
      <div className="pagina-institucional">
        <header className="pagina-institucional-hero">
          <span className="inicio-destaque">CONTATO</span>
          <h1>Fale com a gente</h1>
          <p>
            Tem dúvidas sobre o cadastro, um frete ou um pagamento? Nossa
            equipe está pronta para ajudar.
          </p>
        </header>

        <section className="pagina-institucional-grade">
          <article className="pagina-institucional-card">
            <h2>E-mail</h2>
            <p>
              <a href="mailto:contato@fretar.com.br">
                contato@fretar.com.br
              </a>
            </p>
            <p>Respondemos em até um dia útil.</p>
          </article>

          <article className="pagina-institucional-card">
            <h2>Atendimento</h2>
            <p>Segunda a sexta, das 8h às 18h.</p>
            <p>Para urgências, informe o número do frete no assunto.</p>
          </article>

          <article className="pagina-institucional-card">
            <h2>Onde estamos</h2>
            <p>Porto Alegre, Rio Grande do Sul.</p>
            <p>Atendimento digital em todo o território nacional.</p>
          </article>
        </section>

        <section className="pagina-institucional-secao">
          <h2>Perguntas frequentes</h2>

          <div className="pagina-institucional-faq">
            <article className="pagina-institucional-card">
              <h3>Preciso pagar para usar o Fretar?</h3>
              <p>
                O cadastro é gratuito. O valor do frete é combinado na
                solicitação e pago pela plataforma após a conclusão.
              </p>
            </article>

            <article className="pagina-institucional-card">
              <h3>Como acompanho minha entrega?</h3>
              <p>
                Depois do aceite do motorista, acompanhe o status no painel.
                As atualizações aparecem em tempo real.
              </p>
            </article>

            <article className="pagina-institucional-card">
              <h3>Esqueci minha senha. E agora?</h3>
              <p>
                Entre em contato pelo e-mail de atendimento com o endereço
                cadastrado para receber as orientações de recuperação.
              </p>
            </article>
          </div>
        </section>

        <div className="pagina-institucional-cta">
          <Link className="btn-criar" to="/cadastro">
            Criar conta
          </Link>
          <Link className="btn-entrar" to="/login">
            Acessar minha conta
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Contato;
