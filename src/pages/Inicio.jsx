import { Link } from "react-router-dom";

import { useSessao } from "../context/SessaoContext";

function Inicio() {
  const { logado, papel } = useSessao();

  const destinoPainel = papel === "driver" ? "/motorista" : "/cliente";

  return (
    <main className="cadastro-layout inicio-layout">
      <section className="inicio-conteudo">
        <span className="inicio-destaque">FRETE, SEM FRETAR</span>

        <h1>
          Conectamos você a
          <span>motoristas de confiança.</span>
        </h1>

        <p className="inicio-descricao">
          Solicite um frete, acompanhe a rota em tempo real e pague com
          segurança, direto pela plataforma.
        </p>

        <div className="inicio-acoes">
          {logado ? (
            <Link className="btn-criar" to={destinoPainel}>
              Acessar meu painel
            </Link>
          ) : (
            <Link className="btn-criar" to="/login">
              Entrar para solicitar um frete
            </Link>
          )}

          {!logado && (
            <Link className="btn-entrar" to="/cadastro">
              Criar conta
            </Link>
          )}
        </div>

        <div className="inicio-beneficios">
          <div className="inicio-beneficio">
            <span>🚚</span>
            <strong>Motoristas próximos</strong>
          </div>
          <div className="inicio-beneficio">
            <span>🗺️</span>
            <strong>Rota em tempo real</strong>
          </div>
          <div className="inicio-beneficio">
            <span>🔒</span>
            <strong>Pagamento seguro</strong>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Inicio;