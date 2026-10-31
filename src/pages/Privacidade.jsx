import { Link } from "react-router-dom";

function Privacidade() {
  return (
    <main className="pagina-institucional-layout">
      <div className="pagina-institucional">
        <header className="pagina-institucional-hero">
          <span className="inicio-destaque">PRIVACIDADE</span>
          <h1>Política de Privacidade</h1>
          <p>
            Esta política explica como o Fretar coleta, utiliza e protege os
            dados pessoais de clientes e motoristas.
          </p>
          <p className="pagina-institucional-nota">
            Última atualização: outubro de 2026.
          </p>
        </header>

        <section className="pagina-institucional-texto">
          <article className="pagina-institucional-card">
            <h2>1. Dados que coletamos</h2>
            <ul className="pagina-institucional-lista">
              <li>Dados de cadastro, como nome, e-mail, telefone e endereço.</li>
              <li>Informações do veículo, quando o usuário atua como motorista.</li>
              <li>Dados dos fretes, como origem, destino, carga e valores.</li>
              <li>Registros de uso, acesso e interações com a plataforma.</li>
            </ul>
          </article>

          <article className="pagina-institucional-card">
            <h2>2. Como usamos os dados</h2>
            <p>
              Utilizamos as informações para criar e manter a conta, conectar
              clientes e motoristas, processar fretes e pagamentos, oferecer
              suporte e melhorar a segurança da plataforma.
            </p>
            <p>
              Também podemos usar os dados para enviar comunicações
              relacionadas ao serviço, sempre respeitando as preferências do
              usuário.
            </p>
          </article>

          <article className="pagina-institucional-card">
            <h2>3. Compartilhamento</h2>
            <p>
              Compartilhamos apenas as informações necessárias para a execução
              do frete entre cliente e motorista, além de prestadores de
              serviços essenciais, como processamento de pagamentos e
              hospedagem.
            </p>
            <p>
              Não vendemos dados pessoais. Divulgações adicionais podem ocorrer
              quando exigidas por lei ou para proteger direitos do Fretar e de
              seus usuários.
            </p>
          </article>

          <article className="pagina-institucional-card">
            <h2>4. Segurança e retenção</h2>
            <p>
              Adotamos medidas técnicas e administrativas para proteger os
              dados contra acesso não autorizado, perda ou alteração. As
              informações são mantidas pelo tempo necessário ao funcionamento
              do serviço e ao cumprimento de obrigações legais.
            </p>
          </article>

          <article className="pagina-institucional-card">
            <h2>5. Seus direitos</h2>
            <p>
              Nos termos da Lei Geral de Proteção de Dados (LGPD), você pode
              solicitar a confirmação, o acesso, a correção, a portabilidade ou
              a exclusão de seus dados pessoais.
            </p>
            <p>
              Para exercer esses direitos, entre em contato pelo e-mail de
              atendimento informado na página de contato.
            </p>
          </article>

          <article className="pagina-institucional-card">
            <h2>6. Cookies e tecnologias semelhantes</h2>
            <p>
              Podemos utilizar cookies e armazenamento local para manter a
              sessão, lembrar preferências, como o tema escolhido, e medir o
              desempenho da aplicação. Você pode gerenciar essas preferências
              nas configurações do seu navegador.
            </p>
          </article>

          <article className="pagina-institucional-card">
            <h2>7. Contato</h2>
            <p>
              Dúvidas sobre esta política podem ser enviadas para{" "}
              <a href="mailto:contato@fretar.com.br">
                contato@fretar.com.br
              </a>
              . Também estamos disponíveis pela{" "}
              <Link to="/contato">página de contato</Link>.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}

export default Privacidade;
