import { useCallback, useEffect, useState } from "react";

import { api } from "../lib/api";
import { useSessao } from "../context/SessaoContext";
import SimulacaoTrajeto, {
  temCoordenadas,
  simulacaoEmAndamento,
} from "../components/SimulacaoTrajeto";

const INTERVALO_POLLING_MS = 3000;

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function extrairLista(dados) {
  if (Array.isArray(dados)) return dados;
  return dados?.data || [];
}

function Estrelas({ nota }) {
  return (
    <span className="estrelas lidas" aria-label={`${nota} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((valor) => (
        <span
          key={valor}
          className={valor <= nota ? "estrela ativa" : "estrela"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function MotoristaPainel() {
  const { usuario } = useSessao();

  const [ofertas, setOfertas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [emProcessamento, setEmProcessamento] = useState(null);

  const avaliacoes = ofertas
    .map((oferta) => oferta.shipping?.avaliacao)
    .filter(Boolean);
  const notaMedia = avaliacoes.length
    ? (avaliacoes.reduce((soma, item) => soma + item.rating, 0) /
        avaliacoes.length).toFixed(1).replace(".", ",")
    : null;

  const carregarOfertas = useCallback(async ({ silencioso = false } = {}) => {
    if (silencioso) {
      setAtualizando(true);
    } else {
      setCarregando(true);
    }

    try {
      const dados = await api("/me/offers");
      setOfertas(extrairLista(dados));
      setUltimaAtualizacao(new Date());
      setErro("");
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useEffect(() => {
    carregarOfertas();

    const id = setInterval(
      () => carregarOfertas({ silencioso: true }),
      INTERVALO_POLLING_MS
    );

    return () => clearInterval(id);
  }, [carregarOfertas]);

  async function executar(shippingId, acao, mensagemSucesso) {
    setEmProcessamento(shippingId);
    setErro("");
    setMensagem("");

    try {
      await acao();
      setMensagem(mensagemSucesso);
      await carregarOfertas({ silencioso: true });
    } catch (e) {
      setErro(e.message);
    } finally {
      setEmProcessamento(null);
    }
  }

  function responder(oferta, status) {
    const { id } = oferta.shipping;

    executar(
      id,
      () =>
        api(`/shippings/${id}/responder`, {
          metodo: "POST",
          corpo: { status },
        }),
      status === "accepted"
        ? "Oferta aceita! O frete agora está atribuído a você."
        : "Oferta recusada."
    );
  }

  function iniciar(oferta) {
    const { id } = oferta.shipping;

    executar(
      id,
      () => api(`/shippings/${id}/iniciar`, { metodo: "POST" }),
      "Frete iniciado. Boa viagem!"
    );
  }

  function concluir(oferta) {
    const { id } = oferta.shipping;

    executar(
      id,
      () => api(`/shippings/${id}/concluir`, { metodo: "POST" }),
      "Frete concluído com sucesso."
    );
  }

  function iniciarSimulacao(frete) {
    executar(
      frete.id,
      () => api(`/shippings/${frete.id}/simulacao/iniciar`, { metodo: "POST" }),
      "Simulação iniciada. O cliente pode acompanhar em tempo real."
    );
  }

  function pararSimulacao(frete) {
    executar(
      frete.id,
      () => api(`/shippings/${frete.id}/simulacao/parar`, { metodo: "POST" }),
      "Simulação encerrada."
    );
  }

  return (
    <main className="painel-layout">
      <header className="painel-cabecalho">
        <div>
          <h1>Painel do motorista</h1>
          <p>Olá, {usuario?.name}. Acompanhe e responda suas ofertas.</p>
          {notaMedia && (
            <span className="painel-badge-media">
              ⭐ Média {notaMedia} · {avaliacoes.length}{" "}
              {avaliacoes.length === 1 ? "avaliação" : "avaliações"}
            </span>
          )}
        </div>

        <span
          className={atualizando ? "painel-status ativo" : "painel-status"}
          title={
            ultimaAtualizacao
              ? `Última atualização: ${ultimaAtualizacao.toLocaleTimeString("pt-BR")}`
              : undefined
          }
        >
          <span className="painel-status-bolinha" />
          {atualizando ? "Atualizando..." : "Tempo real (3s)"}
        </span>
      </header>

      {erro && <div className="mensagem-cadastro erro">{erro}</div>}
      {mensagem && <div className="mensagem-cadastro sucesso">{mensagem}</div>}

      <section className="painel-card">
        <h3>Ofertas recebidas</h3>
        <p className="painel-sub">
          Atualizado automaticamente a cada 3 segundos.
        </p>

        {carregando && <p className="painel-vazio">Carregando ofertas...</p>}

        {!carregando && ofertas.length === 0 && (
          <p className="painel-vazio">
            Nenhuma oferta no momento. Aguarde novas solicitações.
          </p>
        )}

        <ul className="painel-lista">
          {ofertas.map((oferta) => {
            const frete = oferta.shipping;
            const ocupado = emProcessamento === frete.id;
            const simEmAndamento = simulacaoEmAndamento(frete);
            const podeSimular = ["driver_assigned", "in_transit"].includes(
              frete.status
            );

            return (
              <li key={`${frete.id}-${oferta.offer_status}`} className="frete-card">
                <div className="frete-cabecalho">
                  <strong>#{frete.id}</strong>
                  <span className={`frete-status status-${frete.status}`}>
                    {frete.status_label}
                  </span>
                </div>

                <p className="frete-rota">
                  {frete.origin} → {frete.destination}
                </p>

                <div className="frete-meta">
                  <span>{formatarMoeda(frete.value)}</span>
                  {frete.about_load && <span>Carga: {frete.about_load}</span>}
                  <span>Oferta: {oferta.offer_status_label}</span>
                </div>

                <div className="frete-acoes">
                  {oferta.offer_status === "pending" &&
                    frete.status === "searching_driver" && (
                      <>
                        <button
                          type="button"
                          className="mapa-btn"
                          disabled={ocupado}
                          onClick={() => responder(oferta, "accepted")}
                        >
                          {ocupado ? "..." : "Aceitar"}
                        </button>
                        <button
                          type="button"
                          className="mapa-btn secundario"
                          disabled={ocupado}
                          onClick={() => responder(oferta, "rejected")}
                        >
                          Recusar
                        </button>
                      </>
                    )}

                  {oferta.offer_status === "accepted" &&
                    frete.status === "driver_assigned" && (
                      <button
                        type="button"
                        className="mapa-btn"
                        disabled={ocupado}
                        onClick={() => iniciar(oferta)}
                      >
                        {ocupado ? "..." : "Iniciar trajeto"}
                      </button>
                    )}

                  {oferta.offer_status === "accepted" &&
                    frete.status === "in_transit" && (
                      <button
                        type="button"
                        className="mapa-btn"
                        disabled={ocupado}
                        onClick={() => concluir(oferta)}
                      >
                        {ocupado ? "..." : "Concluir frete"}
                      </button>
                    )}

                  {oferta.offer_status === "accepted" &&
                    frete.status === "completed" && (
                      <span className="frete-badge sucesso">Concluído</span>
                    )}

                  {oferta.offer_status === "rejected" && (
                    <span className="frete-badge">Recusada</span>
                  )}

                  {temCoordenadas(frete) && (simEmAndamento || podeSimular) && (
                    <button
                      type="button"
                      className={
                        simEmAndamento ? "mapa-btn" : "mapa-btn secundario"
                      }
                      disabled={ocupado}
                      onClick={() =>
                        simEmAndamento
                          ? pararSimulacao(frete)
                          : iniciarSimulacao(frete)
                      }
                    >
                      {simEmAndamento
                        ? "⏹ Parar simulação"
                        : "🚚 Iniciar simulação"}
                    </button>
                  )}
                </div>

                {simEmAndamento && (
                  <SimulacaoTrajeto
                    key={frete.id}
                    frete={frete}
                    modo="motorista"
                  />
                )}

                {frete.status === "completed" && frete.avaliacao && (
                  <div className="frete-avaliacao-lida">
                    <Estrelas nota={frete.avaliacao.rating} />
                    {frete.avaliacao.comment && (
                      <p className="frete-avaliacao-comentario">
                        “{frete.avaliacao.comment}”
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

export default MotoristaPainel;
