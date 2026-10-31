import { useEffect, useMemo, useState } from "react";

import { api } from "../lib/api";
import { useSessao } from "../context/SessaoContext";

const FILTROS = [
  { chave: "todas", rotulo: "Todas" },
  { chave: "andamento", rotulo: "Em andamento" },
  { chave: "concluida", rotulo: "Concluídas" },
  { chave: "cancelada", rotulo: "Canceladas" },
];

const GRUPO_STATUS = {
  pending: "andamento",
  searching_driver: "andamento",
  driver_assigned: "andamento",
  in_transit: "andamento",
  completed: "concluida",
  cancelled: "cancelada",
};

const CLASSE_STATUS = {
  completed: "status-concluida",
  cancelled: "status-cancelada",
};

function formatarData(dataISO) {
  if (!dataISO) {
    return "Sem data";
  }

  const data = new Date(dataISO);

  if (Number.isNaN(data.getTime())) {
    return "Sem data";
  }

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatarValor(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function normalizarViagem(frete) {
  const status = frete.status || "pending";

  return {
    id: frete.id,
    origem: frete.origin || "Origem não informada",
    destino: frete.destination || "Destino não informado",
    data: frete.completed_at || frete.created_at,
    motorista: frete.driver?.name || "Aguardando motorista",
    usuario: frete.user?.name || "Cliente",
    veiculo: frete.recommended_vehicle || "Não informado",
    carga: frete.about_load || "Não informada",
    valor: Number(frete.value || 0),
    status,
    statusGrupo: GRUPO_STATUS[status] || "andamento",
    statusRotulo: frete.status_label || status,
    statusClasse: CLASSE_STATUS[status] || "status-andamento",
    pago: Boolean(frete.pago),
    avaliacao: frete.avaliacao,
    origemCoordenadas:
      frete.origin_lat != null && frete.origin_lng != null
        ? [frete.origin_lat, frete.origin_lng]
        : null,
    destinoCoordenadas:
      frete.destination_lat != null && frete.destination_lng != null
        ? [frete.destination_lat, frete.destination_lng]
        : null,
  };
}

function extrairLista(dados) {
  if (Array.isArray(dados)) return dados;
  return dados?.data || [];
}

function Historico() {
  const { usuario, papel } = useSessao();

  const [viagens, setViagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("todas");
  const [busca, setBusca] = useState("");

  const [visualizacao, setVisualizacao] = useState("lista");
  const [viagemSelecionada, setViagemSelecionada] = useState(null);

  const esMotorista = papel === "driver";

  useEffect(() => {
    let ativo = true;

    async function carregarViagens() {
      try {
        const dados = await api("/me/shippings");

        if (!ativo) return;

        setViagens(extrairLista(dados).map(normalizarViagem));
        setErro("");
      } catch (e) {
        if (!ativo) return;

        setErro(e.message);
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarViagens();

    return () => {
      ativo = false;
    };
  }, []);

  const viagensFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return viagens
      .filter(
        (viagem) =>
          filtroAtivo === "todas" || viagem.statusGrupo === filtroAtivo
      )
      .filter((viagem) => {
        if (!termo) {
          return true;
        }

        const buscaNome = esMotorista
          ? viagem.usuario.toLowerCase().includes(termo)
          : viagem.motorista.toLowerCase().includes(termo);

        return (
          viagem.origem.toLowerCase().includes(termo) ||
          viagem.destino.toLowerCase().includes(termo) ||
          buscaNome
        );
      })
      .sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
  }, [viagens, filtroAtivo, busca, esMotorista]);

  const totalFinancas = useMemo(() => {
    return viagens
      .filter((viagem) => viagem.status === "completed")
      .reduce((soma, viagem) => soma + viagem.valor, 0);
  }, [viagens]);

  if (visualizacao === "detalhes" && viagemSelecionada) {
    return (
      <main className="historico-layout">
        <section
          className="detalhes-corrida-layout"
          style={{
            background: "#ffffff",
            padding: "35px",
            borderRadius: "22px",
            border: "1px solid #e0e6dc",
            boxShadow: "0 10px 30px rgba(20,35,20,0.04)",
          }}
        >
          <button
            type="button"
            className="btn-entrar"
            onClick={() => setVisualizacao("lista")}
            style={{ marginBottom: "30px", fontWeight: "800" }}
          >
            ← Voltar
          </button>

          <div
            style={{
              display: "flex",
              gap: "40px",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "35px",
            }}
          >
            <div
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                background: "#eef8e9",
                border: "2px solid #4c9828",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "44px",
              }}
            >
              {esMotorista ? "👤" : "👨‍✈️"}
            </div>

            <div style={{ flex: 1, minWidth: "250px" }}>
              <span
                className="viagem-info-rotulo"
                style={{ display: "block", marginBottom: "4px" }}
              >
                {esMotorista ? "Dados do Cliente" : "Dados do Motorista"}
              </span>
              <h2
                style={{
                  fontSize: "26px",
                  color: "#172033",
                  fontWeight: "800",
                  marginBottom: "15px",
                }}
              >
                {esMotorista
                  ? viagemSelecionada.usuario
                  : viagemSelecionada.motorista}
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "15px",
                }}
              >
                <p>
                  <strong>Rota:</strong> {viagemSelecionada.origem} ➔{" "}
                  {viagemSelecionada.destino}
                </p>
                <p>
                  <strong>Data:</strong> {formatarData(viagemSelecionada.data)}
                </p>
                <p>
                  <strong>Transporte:</strong> {viagemSelecionada.veiculo}
                </p>
                <p>
                  <strong>Carga:</strong> {viagemSelecionada.carga}
                </p>
                <p>
                  <strong>Total da Corrida:</strong>{" "}
                  <span style={{ color: "#4c9828", fontWeight: "800" }}>
                    {formatarValor(viagemSelecionada.valor)}
                  </span>
                </p>
                <p>
                  <strong>Pagamento:</strong>{" "}
                  {viagemSelecionada.pago ? "Aprovado" : "Pendente"}
                </p>
                {viagemSelecionada.avaliacao && (
                  <p>
                    <strong>Avaliação:</strong>{" "}
                    {viagemSelecionada.avaliacao.rating}/5
                    {viagemSelecionada.avaliacao.comment
                      ? ` - ${viagemSelecionada.avaliacao.comment}`
                      : ""}
                  </p>
                )}
              </div>
            </div>

            <span
              className={`status-viagem ${viagemSelecionada.statusClasse}`}
            >
              {viagemSelecionada.statusRotulo}
            </span>
          </div>

          <div
            style={{
              height: "300px",
              background: "#f4f7f2",
              border: "2px dashed #c9d5c3",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#506078",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "32px" }}>🗺️</span>
            <strong style={{ color: "#172033" }}>Mapa do Percurso</strong>
            {viagemSelecionada.origemCoordenadas &&
            viagemSelecionada.destinoCoordenadas ? (
              <p style={{ fontSize: "13px", color: "#667287" }}>
                {viagemSelecionada.origemCoordenadas.join(", ")} ➔{" "}
                {viagemSelecionada.destinoCoordenadas.join(", ")}
              </p>
            ) : (
              <p style={{ fontSize: "13px", color: "#667287" }}>
                Coordenadas não informadas para esta corrida.
              </p>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="historico-layout">
      <section className="historico-cabecalho">
        <div className="historico-titulo">
          <h2>{esMotorista ? "Histórico de corridas" : "Histórico de viagens"}</h2>
          <p>
            {esMotorista
              ? "Acompanhe seus fretes realizados, em andamento e cancelados"
              : "Acompanhe suas viagens anteriores, em andamento e canceladas"}
          </p>
          {usuario?.name && <p>Conta: {usuario.name}</p>}
        </div>

        <div className="historico-resumo">
          <span>
            {esMotorista
              ? "Total faturado em corridas"
              : "Total gasto em viagens concluídas"}
          </span>
          <strong>{formatarValor(totalFinancas)}</strong>
        </div>
      </section>

      <section className="historico-controles">
        <div className="historico-filtros">
          {FILTROS.map((filtro) => (
            <button
              key={filtro.chave}
              type="button"
              className={
                filtroAtivo === filtro.chave
                  ? "filtro-historico ativo"
                  : "filtro-historico"
              }
              onClick={() => setFiltroAtivo(filtro.chave)}
            >
              {filtro.rotulo}
            </button>
          ))}
        </div>

        <div className="historico-busca">
          <input
            type="text"
            placeholder={
              esMotorista
                ? "Buscar por cidade ou cliente"
                : "Buscar por cidade ou motorista"
            }
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            aria-label="Buscar viagens"
          />
        </div>
      </section>

      {erro && <div className="mensagem-cadastro erro">{erro}</div>}

      <section className="historico-lista">
        {carregando && (
          <div className="historico-vazio">
            <p>Carregando histórico...</p>
          </div>
        )}

        {!carregando && viagensFiltradas.length === 0 && (
          <div className="historico-vazio">
            <p>Nenhuma viagem encontrada para esse filtro.</p>
          </div>
        )}

        {!carregando &&
          viagensFiltradas.map((viagem) => (
            <article
              key={viagem.id}
              className="viagem-card"
              onClick={() => {
                setViagemSelecionada(viagem);
                setVisualizacao("detalhes");
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="viagem-rota">
                <div className="viagem-pontos">
                  <span className="ponto ponto-origem">{viagem.origem}</span>

                  <span className="viagem-seta">→</span>

                  <span className="ponto ponto-destino">{viagem.destino}</span>
                </div>

                <span className="viagem-data">{formatarData(viagem.data)}</span>
              </div>

              <div className="viagem-detalhes">
                <div className="viagem-info">
                  <span className="viagem-info-rotulo">
                    {esMotorista ? "Cliente" : "Motorista"}
                  </span>
                  <span>
                    {esMotorista
                      ? viagem.usuario || "Cliente"
                      : viagem.motorista}
                  </span>
                </div>

                <div className="viagem-info">
                  <span className="viagem-info-rotulo">Veículo</span>
                  <span>{viagem.veiculo}</span>
                </div>

                <div className="viagem-info">
                  <span className="viagem-info-rotulo">
                    {esMotorista ? "Ganhos" : "Valor"}
                  </span>
                  <span>{formatarValor(viagem.valor)}</span>
                </div>
              </div>

              <span className={`status-viagem ${viagem.statusClasse}`}>
                {viagem.statusRotulo}
              </span>
            </article>
          ))}
      </section>
    </main>
  );
}

export default Historico;
