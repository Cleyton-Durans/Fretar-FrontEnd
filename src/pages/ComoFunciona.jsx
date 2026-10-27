import { Link } from "react-router-dom";

const PASSOS = [
  {
    titulo: "Cadastre-se",
    texto:
      "Crie sua conta como cliente ou motorista. O cadastro leva menos de dois minutos e libera o acesso aos painéis.",
  },
  {
    titulo: "Solicite o frete",
    texto:
      "Informe origem, destino, tipo de carga e valor. O mapa ajuda a definir a rota e calcular uma sugestão de preço.",
  },
  {
    titulo: "Receba ofertas",
    texto:
      "Motoristas disponíveis recebem a solicitação e respondem com o aceite. Você acompanha cada oferta em tempo real.",
  },
  {
    titulo: "Acompanhe e pague",
    texto:
      "Depois do aceite, acompanhe o trajeto, confirme a conclusão e realize o pagamento com segurança pela plataforma.",
  },
];

function ComoFunciona() {
  return (
    <main className="pagina-institucional-layout">
      <div className="pagina-institucional">
        <header className="pagina-institucional-hero">
          <span className="inicio-destaque">COMO FUNCIONA</span>
          <h1>Do pedido à entrega, sem complicação</h1>
          <p>
            O Fretar conecta clientes e motoristas em uma única plataforma.
            Você solicita, acompanha e paga o frete sem sair do painel.
          </p>
        </header>

        <section className="pagina-institucional-grade">
          {PASSOS.map((passo, indice) => (
            <article className="pagina-institucional-card" key={passo.titulo}>
              <span className="pagina-institucional-numero">{indice + 1}</span>
              <h2>{passo.titulo}</h2>
              <p>{passo.texto}</p>
            </article>
          ))}
        </section>

        <section className="pagina-institucional-secao pagina-institucional-duas-colunas">
          <article className="pagina-institucional-card">
            <h2>Para quem precisa enviar</h2>
            <ul className="pagina-institucional-lista">
              <li>Descreva a carga e escolha a rota no mapa.</li>
              <li>Receba motoristas disponíveis para o seu frete.</li>
              <li>Acompanhe o status e o deslocamento em tempo real.</li>
              <li>Pague pela plataforma e avalie o atendimento.</li>
            </ul>
          </article>

          <article className="pagina-institucional-card">
            <h2>Para quem transporta</h2>
            <ul className="pagina-institucional-lista">
              <li>Cadastre seu veículo e informe a capacidade de carga.</li>
              <li>Veja solicitações compatíveis com a sua região.</li>
              <li>Aceite a corrida e atualize o status da entrega.</li>
              <li>Acompanhe seus ganhos no histórico de corridas.</li>
            </ul>
          </article>
        </section>

        <div className="pagina-institucional-cta">
          <Link className="btn-criar" to="/cadastro">
            Criar conta
          </Link>
          <Link className="btn-entrar" to="/login">
            Entrar
          </Link>
        </div>
      </div>
    </main>
  );
}

export default ComoFunciona;
