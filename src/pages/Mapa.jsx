import { useEffect, useRef, useState } from "react";

import MapaRota from "../components/MapaRota";
import BuscarEndereco from "../components/BuscarEndereco";
import { enderecoPorCoordenadas } from "../lib/geocode";
import { useGeolocalizacao } from "../lib/useGeolocalizacao";

const ORIGEM_PADRAO = null; // sem origem fixa: visualização global [0, 0]

export default function PaginaMapa() {
  const { posicao, obtendo, erro, obter } = useGeolocalizacao();

  const [origem, setOrigem] = useState(null);
  const [destino, setDestino] = useState(null);
  const [alvoSelecao, setAlvoSelecao] = useState("origem");
  const [rotuloOrigem, setRotuloOrigem] = useState("");
  const [rotuloDestino, setRotuloDestino] = useState("");
  const [origemProgramatica, setOrigemProgramatica] = useState(false);
  const [destinoProgramatica, setDestinoProgramatica] = useState(false);

  const [rota, setRota] = useState([]);
  const [infoRota, setInfoRota] = useState(null);

  const [buscandoRota, setBuscandoRota] = useState(false);
  const [erroRota, setErroRota] = useState(null);

  const [simulando, setSimulando] = useState(false);
  const [frame, setFrame] = useState(0);

  const [foco, setFoco] = useState(null);

  const [msgLocalizacao, setMsgLocalizacao] = useState(null);

  const mapaRef = useRef(null);

  const usandoMinhaPosicao = Boolean(posicao);

  const origemEfetiva = origem ?? posicao ?? ORIGEM_PADRAO;

  const veiculo =
    simulando && rota.length > 0
      ? rota[Math.min(frame, rota.length - 1)]
      : null;

  const progresso =
    rota.length > 1
      ? Math.min(100, Math.round((frame / (rota.length - 1)) * 100))
      : 0;

  function limparRota() {
    setRota([]);
    setInfoRota(null);
    setErroRota(null);
    setSimulando(false);
    setFrame(0);
  }

  function aoClicarNoMapa(ponto) {
    if (alvoSelecao === "origem") {
      setOrigem(ponto);
      setRotuloOrigem("Ponto selecionado no mapa");
      setOrigemProgramatica(true);
      setAlvoSelecao("destino");
    } else {
      setDestino(ponto);
      setRotuloDestino("Ponto selecionado no mapa");
      setDestinoProgramatica(true);
    }
    setFoco(ponto);
    limparRota();
  }

  function escolherOrigem(item) {
    setOrigem([item.lat, item.lng]);
    setRotuloOrigem(item.rotulo);
    setOrigemProgramatica(true);
    setAlvoSelecao("destino");
    setMsgLocalizacao(null);
    setFoco([item.lat, item.lng]);
    limparRota();
  }

  function escolherDestino(item) {
    setDestino([item.lat, item.lng]);
    setRotuloDestino(item.rotulo);
    setDestinoProgramatica(true);
    setFoco([item.lat, item.lng]);
    limparRota();
  }

  async function usarMinhaLocalizacao() {
    setOrigem(null);
    setOrigemProgramatica(true);
    setMsgLocalizacao(null);
    limparRota();
    obter();

    if (posicao) {
      setRotuloOrigem("Buscando endereço...");
      setFoco(posicao);
      mapaRef.current?.flyTo(posicao, 15, { duration: 0.8 });

      const endereco = await enderecoPorCoordenadas(posicao[0], posicao[1]);
      setRotuloOrigem(endereco || "Minha localização atual");
    }
  }

  useEffect(() => {
    if (posicao && !origem && usandoMinhaPosicao) {
      setFoco(posicao);
      setRotuloOrigem("Buscando endereço...");

      enderecoPorCoordenadas(posicao[0], posicao[1]).then((endereco) => {
        setRotuloOrigem(endereco || "Minha localização atual");
      });
    }
  }, [posicao, origem, usandoMinhaPosicao]);

  useEffect(() => {
    if (!obtendo && erro && !posicao) {
      setMsgLocalizacao({ tipo: "erro", texto: erro });
    }
  }, [obtendo, erro, posicao]);

  async function tracarRota() {
    if (!origemEfetiva || !destino) {
      setErroRota("Escolha a origem e o destino para traçar a rota.");
      return;
    }

    setBuscandoRota(true);
    setErroRota(null);
    setSimulando(false);
    setFrame(0);

    try {
      const [origemLat, origemLng] = origemEfetiva;
      const [destLat, destLng] = destino;

      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${origemLng},${origemLat};${destLng},${destLat}` +
        `?overview=full&geometries=geojson`;

      const resposta = await fetch(url);
      const dados = await resposta.json();

      if (!dados.routes || dados.routes.length === 0) {
        throw new Error("Nenhuma rota encontrada entre esses pontos.");
      }

      const rotaGeoJson = dados.routes[0];

      setRota(
        rotaGeoJson.geometry.coordinates.map(([lng, lat]) => [lat, lng])
      );

      setInfoRota({
        distanciaKm: (rotaGeoJson.distance / 1000).toFixed(1),
        duracaoMin: Math.round(rotaGeoJson.duration / 60),
      });

      mapaRef.current?.flyToBounds(
        [
          [origemEfetiva[0], origemEfetiva[1]],
          [destino[0], destino[1]],
        ],
        { padding: [50, 50], duration: 0.8 }
      );
    } catch (e) {
      setErroRota(e.message || "Erro ao traçar rota. Tente novamente.");
    } finally {
      setBuscandoRota(false);
    }
  }

  function iniciarSimulacao() {
    if (rota.length === 0) return;
    setFrame(0);
    setSimulando(true);
  }

  function pararSimulacao() {
    setSimulando(false);
    setFrame(0);
  }

  useEffect(() => {
    if (!simulando) return;

    const total = rota.length - 1;

    if (total <= 0) {
      setSimulando(false);
      return;
    }

    const passoMs = Math.max(25, Math.round(12000 / total));

    const id = setInterval(() => {
      setFrame((atual) => {
        if (atual >= total) {
          clearInterval(id);
          setSimulando(false);
          return total;
        }
        return atual + 1;
      });
    }, passoMs);

    return () => clearInterval(id);
  }, [simulando, rota]);

  useEffect(() => {
    if (simulando && veiculo) {
      mapaRef.current?.panTo(veiculo, { animate: true });
    }
  }, [frame, simulando, veiculo]);

  return (
    <main className="mapa-layout">
      <MapaRota
        origem={origemEfetiva}
        destino={destino}
        rota={rota}
        veiculo={veiculo}
        foco={foco}
        mapaRef={mapaRef}
        aoClicarNoMapa={aoClicarNoMapa}
      />

      <aside className="mapa-painel">
        <h3>Traçar rota</h3>
        <p className="mapa-painel-sub">
          Busque a origem e o destino nos campos, ou clique no mapa.
        </p>

        <div className="mapa-selecao-tipos">
          <button
            type="button"
            className={
              alvoSelecao === "origem" ? "tipo-conta ativo" : "tipo-conta"
            }
            onClick={() => setAlvoSelecao("origem")}
          >
            📍 Origem
          </button>
          <button
            type="button"
            className={
              alvoSelecao === "destino" ? "tipo-conta ativo" : "tipo-conta"
            }
            onClick={() => setAlvoSelecao("destino")}
          >
            🏁 Destino
          </button>
        </div>

        <div className="mapa-form">
          <BuscarEndereco
            placeholder="De onde? Ex.: Centro de Porto Alegre"
            value={rotuloOrigem}
            programatica={origemProgramatica}
            onAlterar={(texto) => {
              setRotuloOrigem(texto);
              setOrigemProgramatica(false);
            }}
            aoEscolher={escolherOrigem}
          />

          <BuscarEndereco
            placeholder="Para onde? Ex.: Aeroporto"
            value={rotuloDestino}
            programatica={destinoProgramatica}
            onAlterar={(texto) => {
              setRotuloDestino(texto);
              setDestinoProgramatica(false);
            }}
            aoEscolher={escolherDestino}
          />

          <div className="mapa-acoes">
            <button
              type="button"
              className="mapa-btn"
              onClick={tracarRota}
              disabled={buscandoRota || !destino}
            >
              {buscandoRota ? "Calculando..." : "Traçar rota"}
            </button>

            <button
              type="button"
              className="mapa-btn secundario"
              onClick={usarMinhaLocalizacao}
              disabled={obtendo}
            >
              {obtendo
                ? "Buscando..."
                : usandoMinhaPosicao
                  ? "📍 Minha localização"
                  : "📍 Usar minha localização"}
            </button>
          </div>
        </div>

        {msgLocalizacao && (
          <div className={`mensagem-cadastro ${msgLocalizacao.tipo}`}>
            {msgLocalizacao.texto}
          </div>
        )}

        {!usandoMinhaPosicao && !origem && (
          <div className="mensagem-cadastro aviso">
            A origem ainda não foi definida. Marque no mapa, busque um
            endereço ou use a sua localização.
          </div>
        )}

        {erroRota && <div className="mensagem-cadastro erro">{erroRota}</div>}

        {infoRota && rota.length > 0 && (
          <>
            <div className="mapa-info">
              <div className="mapa-info-item">
                <span>Distância</span>
                <strong>{infoRota.distanciaKm} km</strong>
              </div>
              <div className="mapa-info-item">
                <span>Tempo</span>
                <strong>{infoRota.duracaoMin} min</strong>
              </div>
            </div>

            <button
              type="button"
              className="mapa-btn"
              onClick={simulando ? pararSimulacao : iniciarSimulacao}
            >
              {simulando ? "⏹ Parar simulação" : "🚚 Simular trajeto"}
            </button>

            <button
              type="button"
              className="mapa-btn secundario mapa-limpar"
              onClick={limparRota}
            >
              Limpar rota
            </button>

            {simulando && (
              <div className="mapa-sim">
                <div className="mapa-sim-cab">
                  <span>Simulando trajeto...</span>
                  <strong>{progresso}%</strong>
                </div>
                <div className="mapa-sim-barra">
                  <div
                    className="mapa-sim-preenchimento"
                    style={{ width: `${progresso}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        <p className="mapa-dica">
          Selecione <strong>Origem</strong> ou <strong>Destino</strong> e
          clique no mapa para marcar o ponto (📍 = origem, 🏁 = destino).
        </p>
      </aside>
    </main>
  );
}