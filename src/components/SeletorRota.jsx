import { useEffect, useRef, useState } from "react";

import MapaRota from "./MapaRota";
import BuscarEndereco from "./BuscarEndereco";
import { enderecoPorCoordenadas } from "../lib/geocode";
import { calcularRota } from "../lib/rota";

function SeletorRota({ aoMudar }) {
  const [pontoOrigem, setPontoOrigem] = useState(null);
  const [pontoDestino, setPontoDestino] = useState(null);
  const [rotuloOrigem, setRotuloOrigem] = useState("");
  const [rotuloDestino, setRotuloDestino] = useState("");
  const [origemProgramatica, setOrigemProgramatica] = useState(false);
  const [destinoProgramatica, setDestinoProgramatica] = useState(false);
  const [alvoSelecao, setAlvoSelecao] = useState("origem");
  const [foco, setFoco] = useState(null);
  const [rota, setRota] = useState([]);
  const [infoRota, setInfoRota] = useState(null);
  const [buscandoRota, setBuscandoRota] = useState(false);
  const [erroRota, setErroRota] = useState(null);

  const mapaRef = useRef(null);

  async function aoClicarNoMapa(ponto) {
    const ehOrigem = alvoSelecao === "origem";
    const definirPonto = ehOrigem ? setPontoOrigem : setPontoDestino;
    const definirRotulo = ehOrigem ? setRotuloOrigem : setRotuloDestino;
    const definirProgramatica = ehOrigem
      ? setOrigemProgramatica
      : setDestinoProgramatica;

    definirPonto(ponto);
    definirRotulo("Buscando endereço...");
    definirProgramatica(true);

    if (ehOrigem) {
      setAlvoSelecao("destino");
    }

    setFoco(ponto);

    const endereco = await enderecoPorCoordenadas(ponto[0], ponto[1]);

    if (endereco) {
      definirRotulo(endereco);
    } else {
      definirRotulo(`${ponto[0].toFixed(5)}, ${ponto[1].toFixed(5)}`);
    }
  }

  function escolherOrigem(item) {
    setPontoOrigem([item.lat, item.lng]);
    setRotuloOrigem(item.rotulo);
    setOrigemProgramatica(true);
    setAlvoSelecao("destino");
    setFoco([item.lat, item.lng]);
  }

  function escolherDestino(item) {
    setPontoDestino([item.lat, item.lng]);
    setRotuloDestino(item.rotulo);
    setDestinoProgramatica(true);
    setFoco([item.lat, item.lng]);
  }

  useEffect(() => {
    if (!pontoOrigem || !pontoDestino) {
      setRota([]);
      setInfoRota(null);
      setErroRota(null);
      return;
    }

    let cancelado = false;
    setBuscandoRota(true);
    setErroRota(null);

    calcularRota(pontoOrigem, pontoDestino)
      .then((resultado) => {
        if (cancelado) return;
        setRota(resultado.pontos);
        setInfoRota({
          distanciaKm: resultado.distanciaKm,
          duracaoMin: resultado.duracaoMin,
        });
        mapaRef.current?.flyToBounds(
          [pontoOrigem, pontoDestino],
          { padding: [50, 50], duration: 0.8 }
        );
      })
      .catch((e) => {
        if (!cancelado) {
          setErroRota(e.message || "Erro ao traçar rota. Tente novamente.");
        }
      })
      .finally(() => {
        if (!cancelado) setBuscandoRota(false);
      });

    return () => {
      cancelado = true;
    };
  }, [pontoOrigem, pontoDestino]);

  useEffect(() => {
    aoMudar?.({
      origem: pontoOrigem,
      destino: pontoDestino,
      rotuloOrigem,
      rotuloDestino,
      distanciaKm: infoRota?.distanciaKm ?? null,
    });
  }, [
    aoMudar,
    pontoOrigem,
    pontoDestino,
    rotuloOrigem,
    rotuloDestino,
    infoRota,
  ]);

  function limpar() {
    setPontoOrigem(null);
    setPontoDestino(null);
    setRotuloOrigem("");
    setRotuloDestino("");
    setOrigemProgramatica(false);
    setDestinoProgramatica(false);
    setAlvoSelecao("origem");
    setRota([]);
    setInfoRota(null);
    setErroRota(null);
  }

  return (
    <div className="seletor-rota">
      <div className="mapa-selecao-tipos">
        <button
          type="button"
          className={alvoSelecao === "origem" ? "tipo-conta ativo" : "tipo-conta"}
          onClick={() => setAlvoSelecao("origem")}
        >
          📍 Origem
        </button>
        <button
          type="button"
          className={alvoSelecao === "destino" ? "tipo-conta ativo" : "tipo-conta"}
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
      </div>

      <div className="seletor-rota-mapa">
        <MapaRota
          origem={pontoOrigem}
          destino={pontoDestino}
          rota={rota}
          foco={foco}
          mapaRef={mapaRef}
          aoClicarNoMapa={aoClicarNoMapa}
        />
      </div>

      {buscandoRota && (
        <div className="mensagem-cadastro aviso">Calculando rota...</div>
      )}

      {erroRota && <div className="mensagem-cadastro erro">{erroRota}</div>}

      {infoRota && (
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
      )}

      <p className="mapa-dica">
        Escolha os pontos no mapa ou busque pelos endereços. A rota é traçada
        automaticamente.
      </p>

      {(pontoOrigem || pontoDestino) && (
        <button type="button" className="mapa-btn secundario mapa-limpar" onClick={limpar}>
          Limpar rota
        </button>
      )}
    </div>
  );
}

export default SeletorRota;
