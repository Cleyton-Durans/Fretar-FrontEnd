import { Link } from "react-router-dom";

import { useSessao } from "../context/SessaoContext";
import "./Inicio.css";

function Inicio() {
  const { logado, papel } = useSessao();
  const destinoPainel = papel === "driver" ? "/motorista" : "/cliente";

  return (
    <main className="inicio-home">
      <section className="inicio-hero">
        <div className="inicio-conteudo">
          

          <h1>
            Conectamos você a
            <span>transportadores de confiança.</span>
          </h1>

          <p className="inicio-descricao">
            Solicite um frete, acompanhe a rota em tempo real e pague com
            segurança, direto pela plataforma.
          </p>

          <div className="inicio-acoes">
            {logado ? (
              <Link className="inicio-btn inicio-btn-principal" to={destinoPainel}>
                Acessar meu painel
              </Link>
            ) : (
              <>
                <Link className="inicio-btn inicio-btn-principal" to="/login">
                  Entrar
                </Link>
                <Link className="inicio-btn inicio-btn-secundario" to="/cadastro">
                  Criar conta
                </Link>
              </>
            )}
          </div>

          
        </div>

        <div className="inicio-visual" aria-label="Visualização de uma rota de frete">
          <div className="inicio-mapa">
            <span className="inicio-rua inicio-rua-um" />
            <span className="inicio-rua inicio-rua-dois" />
            <span className="inicio-rua inicio-rua-tres" />
            <span className="inicio-rota-linha" />
            <span className="inicio-ponto inicio-ponto-origem" />
            <span className="inicio-ponto inicio-ponto-destino" />
            <span className="inicio-veiculo" aria-hidden="true">●</span>

            <div className="inicio-mapa-card">
              <span className="inicio-status"><i /> Frete em andamento</span>
              <strong>Rota acompanhada em tempo real</strong>
              <small>Atualizado agora</small>
            </div>
          </div>

          <div className="inicio-rota-legenda">
            <span><i className="inicio-legenda-origem" /> Origem</span>
            <b />
            <span><i className="inicio-legenda-destino" /> Destino</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Inicio;
