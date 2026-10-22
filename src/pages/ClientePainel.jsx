import { useCallback, useEffect, useState } from "react";

import { api } from "../lib/api";
import { useSessao } from "../context/SessaoContext";
import SeletorRota from "../components/SeletorRota";
import SimulacaoTrajeto, {
  temCoordenadas,
  simulacaoEmAndamento,
} from "../components/SimulacaoTrajeto";

const VALOR_BASE = 20;
const TARIFA_POR_KM = 2.5;
const INTERVALO_POLLING_MS = 3000;

const STATUS_CANCELAVEIS = ["pending", "searching_driver", "driver_assigned"];

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function calcularValorSugerido(distanciaKm) {
  if (!distanciaKm) {
    return VALOR_BASE;
  }
  return Math.max(VALOR_BASE, Number((distanciaKm * TARIFA_POR_KM).toFixed(2)));
}

function extrairLista(dados) {
  if (Array.isArray(dados)) return dados;
  return dados?.data || [];
}

function ClientePainel() {
  const { usuario } = useSessao();

  const [fretes, setFretes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [chaveSeletor, setChaveSeletor] = useState(0);
  const [selecao, setSelecao] = useState(null);
  const [aboutLoad, setAboutLoad] = useState("");
  const [veiculo, setVeiculo] = useState("");
  const [valor, setValor] = useState(VALOR_BASE);
  const [valorManual, setValorManual] = useState(false);
  const [criando, setCriando] = useState(false);

  const [emProcessamento, setEmProcessamento] = useState(null);
  const [avaliando, setAvaliando] = useState(null);

  const carregarFretes = useCallback(async ({ silencioso = false } = {}) => {
    if (silencioso) {
      setAtualizando(true);
    } else {
      setCarregando(true);
    }

    try {
      const dados = await api("/me/shippings");
      setFretes(extrairLista(dados));
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
    carregarFretes();

    const id = setInterval(
      () => carregarFretes({ silencioso: true }),
      INTERVALO_POLLING_MS
    );

    return () => clearInterval(id);
  }, [carregarFretes]);

  const aoMudarSelecao = useCallback((dados) => {
    setSelecao(dados);
  }, []);

  useEffect(() => {
    if (!valorManual) {
      setValor(calcularValorSugerido(selecao?.distanciaKm));
    }
  }, [selecao?.distanciaKm, valorManual]);

  async function criarFrete(event) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    if (!selecao?.rotuloOrigem || !selecao?.rotuloDestino) {
      setErro("Selecione a origem e o destino no mapa antes de criar o frete.");
      return;
    }

    setCriando(true);

    try {
      const frete = await api("/shippings", {
        metodo: "POST",
        corpo: {
          origin: selecao.rotuloOrigem,
          destination: selecao.rotuloDestino,
          origin_lat: selecao.origem?.[0] ?? null,
          origin_lng: selecao.origem?.[1] ?? null,
          destination_lat: selecao.destino?.[0] ?? null,
          destination_lng: selecao.destino?.[1] ?? null,
          about_load: aboutLoad || null,
          recommended_vehicle: veiculo || null,
          value: Number(valor) || 0,
        },
      });

      setMensagem(
        `Frete #${frete.id} criado. Clique em "Procurar motoristas" para ofertar.`
      );
      setAboutLoad("");
      setVeiculo("");
      setValorManual(false);
      setSelecao(null);
      setChaveSeletor((atual) => atual + 1);

      await carregarFretes({ silencioso: true });
    } catch (e) {
      setErro(e.message);
    } finally {
      setCriando(false);
    }
  }

  async function comProcessamento(id, acao) {
    setEmProcessamento(id);
    setErro("");
    setMensagem("");

    try {
      await acao();
    } catch (e) {
      setErro(e.message);
    } finally {
      setEmProcessamento(null);
    }
  }

  function procurarMotoristas(frete) {
    comProcessamento(frete.id, async () => {
      const resposta = await api(
        `/shippings/${frete.id}/procurar-motoristas`,
        { metodo: "POST" }
      );

      setMensagem(resposta.message || "Motoristas ofertados.");
      await carregarFretes({ silencioso: true });
    });
  }

  function cancelarFrete(frete) {
    comProcessamento(frete.id, async () => {
      await api(`/shippings/${frete.id}/cancelar`, { metodo: "POST" });
      setMensagem(`Frete #${frete.id} cancelado.`);
      await carregarFretes({ silencioso: true });
    });
  }

  async function garantirMetodoPagamento() {
    const metodos = extrairLista(await api("/me/payment-methods"));

    if (metodos.length > 0) {
      return metodos[0];
    }

    return api("/me/payment-methods", {
      metodo: "POST",
      corpo: {
        stripe_payment_method_id: `pm_mock_${Date.now()}`,
        type: "card",
        last_4_digits: "4242",
        card_brand: "visa",
      },
    });
  }

  function pagarFrete(frete) {
    comProcessamento(frete.id, async () => {
      const metodo = await garantirMetodoPagamento();

      const pagamento = await api(`/shippings/${frete.id}/payments`, {
        metodo: "POST",
        corpo: { payment_method_id: metodo.id },
      });

      await api(`/payments/${pagamento.id}/confirmar`, { metodo: "POST" });

      setMensagem(`Pagamento de ${formatarMoeda(frete.value)} aprovado.`);
      await carregarFretes({ silencioso: true });
    });
  }

  function abrirAvaliacao(frete) {
    setAvaliando({ id: frete.id, rating: 5, comment: "" });
  }

  async function enviarAvaliacao(event) {
    event.preventDefault();

    if (!avaliando) return;

    const { id, rating, comment } = avaliando;

    await comProcessamento(id, async () => {
      await api(`/shippings/${id}/evaluation`, {
        metodo: "POST",
        corpo: { rating: Number(rating), comment: comment || null },
      });

      setMensagem(`Avaliação registrada para o frete #${id}. Obrigado!`);
      setAvaliando(null);
      await carregarFretes({ silencioso: true });
    });
  }

  return (
    <main className="painel-layout">
      <header className="painel-cabecalho">
        <div>
          <h1>Painel do cliente</h1>
          <p>Olá, {usuario?.name}. Solicite e acompanhe seus fretes.</p>
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

      <div className="painel-grid">
        <section className="painel-card">
          <h3>Novo frete</h3>
          <p className="painel-sub">
            Marque origem e destino no mapa (ou busque pelo endereço).
          </p>

          <SeletorRota key={chaveSeletor} aoMudar={aoMudarSelecao} />

          <form className="painel-form" onSubmit={criarFrete}>
            <div className="campo-cadastro">
              <label htmlFor="carga">Descrição da carga</label>
              <input
                id="carga"
                type="text"
                placeholder="Ex.: 10 caixas de eletrônicos"
                value={aboutLoad}
                onChange={(event) => setAboutLoad(event.target.value)}
              />
            </div>

            <div className="linha-cadastro">
              <div className="campo-cadastro">
                <label htmlFor="veiculo">Veículo recomendado</label>
                <select
                  id="veiculo"
                  value={veiculo}
                  onChange={(event) => setVeiculo(event.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="moto">Moto</option>
                  <option value="carro">Carro</option>
                  <option value="caminhonete">Caminhonete</option>
                  <option value="van">Van</option>
                  <option value="caminhao">Caminhão</option>
                </select>
              </div>

              <div className="campo-cadastro">
                <label htmlFor="valor">Valor estimado (R$)</label>
                <input
                  id="valor"
                  type="number"
                  min="0"
                  step="0.01"
                  value={valor}
                  onChange={(event) => {
                    setValor(event.target.value);
                    setValorManual(true);
                  }}
                />
              </div>
            </div>

            <p className="painel-estimativa">
              Estimativa: {formatarMoeda(valor)} ·{" "}
              {selecao?.distanciaKm
                ? `${selecao.distanciaKm} km × ${formatarMoeda(TARIFA_POR_KM)}/km (mín. ${formatarMoeda(VALOR_BASE)})`
                : "selecione a rota para calcular"}
            </p>

            <button
              type="submit"
              className="btn-cadastrar"
              disabled={criando}
            >
              {criando ? "Criando..." : "Solicitar frete"}
            </button>
          </form>
        </section>

        <section className="painel-card">
          <h3>Minhas solicitações</h3>
          <p className="painel-sub">
            Atualizado automaticamente a cada 3 segundos.
          </p>

          {carregando && <p className="painel-vazio">Carregando fretes...</p>}

          {!carregando && fretes.length === 0 && (
            <p className="painel-vazio">
              Você ainda não solicitou nenhum frete.
            </p>
          )}

          <ul className="painel-lista">
            {fretes.map((frete) => {
              const ocupado = emProcessamento === frete.id;
              const simEmAndamento = simulacaoEmAndamento(frete);

              return (
                <li key={frete.id} className="frete-card">
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
                    {frete.driver?.name && (
                      <span>Motorista: {frete.driver.name}</span>
                    )}
                    {typeof frete.motoristas_ofertados === "number" && (
                      <span>{frete.motoristas_ofertados} ofertado(s)</span>
                    )}
                  </div>

                  <div className="frete-acoes">
                    {frete.status === "pending" && (
                      <button
                        type="button"
                        className="mapa-btn"
                        disabled={ocupado}
                        onClick={() => procurarMotoristas(frete)}
                      >
                        {ocupado ? "..." : "Procurar motoristas"}
                      </button>
                    )}

                    {STATUS_CANCELAVEIS.includes(frete.status) && (
                      <button
                        type="button"
                        className="mapa-btn secundario"
                        disabled={ocupado}
                        onClick={() => cancelarFrete(frete)}
                      >
                        Cancelar
                      </button>
                    )}

                    {frete.status === "completed" && (
                      <>
                        {frete.pago ? (
                          <span className="frete-badge sucesso">
                            Pagamento aprovado
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="mapa-btn"
                            disabled={ocupado}
                            onClick={() => pagarFrete(frete)}
                          >
                            {ocupado ? "..." : `Pagar ${formatarMoeda(frete.value)}`}
                          </button>
                        )}

                        {frete.tem_avaliacao ? (
                          <span className="frete-badge">Avaliado</span>
                        ) : (
                          <button
                            type="button"
                            className="mapa-btn secundario"
                            disabled={ocupado}
                            onClick={() => abrirAvaliacao(frete)}
                          >
                            Avaliar
                          </button>
                        )}
                      </>
                    )}

                    {temCoordenadas(frete) && simEmAndamento && (
                      <span className="frete-badge">
                        🚚 Simulação em andamento
                      </span>
                    )}
                  </div>

                  {simEmAndamento && temCoordenadas(frete) && (
                    <SimulacaoTrajeto
                      key={frete.id}
                      frete={frete}
                      modo="cliente"
                    />
                  )}

                  {avaliando?.id === frete.id && (
                    <form className="frete-avaliacao" onSubmit={enviarAvaliacao}>
                      <div className="estrelas">
                        {[1, 2, 3, 4, 5].map((nota) => (
                          <button
                            key={nota}
                            type="button"
                            className={
                              nota <= avaliando.rating
                                ? "estrela ativa"
                                : "estrela"
                            }
                            onClick={() =>
                              setAvaliando((atual) => ({
                                ...atual,
                                rating: nota,
                              }))
                            }
                            aria-label={`${nota} estrela(s)`}
                          >
                            ★
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows="2"
                        placeholder="Comentário (opcional)"
                        value={avaliando.comment}
                        onChange={(event) =>
                          setAvaliando((atual) => ({
                            ...atual,
                            comment: event.target.value,
                          }))
                        }
                      />

                      <div className="frete-acoes">
                        <button
                          type="submit"
                          className="mapa-btn"
                          disabled={ocupado}
                        >
                          Enviar avaliação
                        </button>
                        <button
                          type="button"
                          className="mapa-btn secundario"
                          onClick={() => setAvaliando(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}

export default ClientePainel;
