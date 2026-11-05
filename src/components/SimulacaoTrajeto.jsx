import { useEffect, useRef, useState } from "react";

import MapaRota from "./MapaRota";
import { calcularRota } from "../lib/rota";

const DURACAO_PADRAO_MS = 120000;

export function temCoordenadas(frete) {
  return (
    frete?.origin_lat != null &&
    frete?.origin_lng != null &&
    frete?.destination_lat != null &&
    frete?.destination_lng != null
  );
}

export function simulacaoEmAndamento(frete) {
  return Boolean(frete?.simulacao_iniciada_em);
}

function SimulacaoTrajeto({ frete, modo = "cliente" }) {
  const duracaoMs = frete.simulacao_duracao_ms || DURACAO_PADRAO_MS;

  const [rota, setRota] = useState([]);
  const [info, setInfo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [progresso, setProgresso] = useState(
    frete.simulacao_progresso ?? 0
  );

  const mapaRef = useRef(null);
  const ancoraRef = useRef({
    base: frete.simulacao_progresso ?? 0,
    t: performance.now(),
  });

  const origem = [Number(frete.origin_lat), Number(frete.origin_lng)];
  const destino = [
    Number(frete.destination_lat),
    Number(frete.destination_lng),
  ];

  useEffect(() => {
    let cancelado = false;

    calcularRota(origem, destino)
      .then((resultado) => {
        if (cancelado) return;
        setRota(resultado.pontos);
        setInfo({
          distanciaKm: resultado.distanciaKm,
          duracaoMin: resultado.duracaoMin,
        });
        setCarregando(false);
      })
      .catch((e) => {
        if (cancelado) return;
        setCarregando(false);
        setErro(e.message || "Erro ao traçar rota. Tente novamente.");
      });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    ancoraRef.current = {
      base: frete.simulacao_progresso ?? 0,
      t: performance.now(),
    };
  }, [frete.simulacao_progresso]);

  useEffect(() => {
    const id = setInterval(() => {
      const { base, t } = ancoraRef.current;
      const p = Math.min(
        1,
        Math.max(0, base + (performance.now() - t) / duracaoMs)
      );
      setProgresso(p);
    }, 80);

    return () => clearInterval(id);
  }, [duracaoMs]);

  const veiculo =
    rota.length > 0
      ? rota[
          Math.min(rota.length - 1, Math.round(progresso * (rota.length - 1)))
        ]
      : null;

  const porcento = Math.round(progresso * 100);
  const concluida = progresso >= 1;

  useEffect(() => {
    if (concluida || !veiculo) return;
    mapaRef.current?.panTo(veiculo, { animate: true });
  }, [porcento, concluida, veiculo]);

  useEffect(() => {
    if (!carregando && !erro && rota.length > 0) {
      mapaRef.current?.flyToBounds([origem, destino], {
        padding: [40, 40],
        duration: 0.6,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carregando, erro]);

  const rotulo = concluida
    ? "Simulação finalizada."
    : modo === "cliente"
      ? "Acompanhando a simulação do motorista..."
      : "Simulando trajeto...";

  return (
    <div className="frete-simulacao">
      {carregando && (
        <p className="painel-vazio">Calculando rota para simulação...</p>
      )}

      {erro && <div className="mensagem-cadastro erro">{erro}</div>}

      {!carregando && !erro && (
        <>
          <div className="frete-simulacao-mapa">
            <MapaRota
              origem={origem}
              destino={destino}
              rota={rota}
              veiculo={veiculo}
              mapaRef={mapaRef}
            />
          </div>

          <div className="mapa-sim">
            <div className="mapa-sim-cab">
              <span>{rotulo}</span>
              <strong>{porcento}%</strong>
            </div>
            <div className="mapa-sim-barra">
              <div
                className="mapa-sim-preenchimento"
                style={{ width: `${porcento}%` }}
              />
            </div>
          </div>

          {info && (
            <p className="frete-simulacao-info">
              {info.distanciaKm} km · {info.duracaoMin} min estimados
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default SimulacaoTrajeto;
