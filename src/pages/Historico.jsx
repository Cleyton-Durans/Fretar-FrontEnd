import { useMemo, useState } from 'react'

const VIAGENS_EXEMPLO = [
  {
    id: 1,
    origem: 'Blumenau, SC',
    destino: 'Florianópolis, SC',
    data: '2026-09-10',
    motorista: 'Carlos Menezes',
    usuario: 'Mariana Silva',
    veiculo: 'Caminhão 3/4 - PJK-4E21',
    valor: 480,
    status: 'concluida'
  },
  {
    id: 2,
    origem: 'Joinville, SC',
    destino: 'Curitiba, PR',
    data: '2026-09-13',
    motorista: 'Aline Souza',
    usuario: 'Pedro Santos',
    veiculo: 'Van - RTS-9A12',
    valor: 610,
    status: 'andamento'
  },
  {
    id: 3,
    origem: 'Blumenau, SC',
    destino: 'Itajaí, SC',
    data: '2026-08-28',
    motorista: 'Roberto Lima',
    usuario: 'Lucas Almeida',
    veiculo: 'Caminhonete - QWE-1122',
    valor: 190,
    status: 'concluida'
  },
  {
    id: 4,
    origem: 'Blumenau, SC',
    destino: 'São Paulo, SP',
    data: '2026-08-15',
    motorista: 'Fernanda Rocha',
    usuario: 'Beatriz Costa',
    veiculo: 'Caminhão Baú - ABC-3344',
    valor: 1250,
    status: 'cancelada'
  },
  {
    id: 5,
    origem: 'Gaspar, SC',
    destino: 'Blumenau, SC',
    data: '2026-07-30',
    motorista: 'Marcos Vinícius',
    usuario: 'Julia Ramos',
    veiculo: 'Van - RTS-9A12',
    valor: 95,
    status: 'concluida'
  }
]

const FILTROS = [
  { chave: 'todas', rotulo: 'Todas' },
  { chave: 'andamento', rotulo: 'Em andamento' },
  { chave: 'concluida', rotulo: 'Concluídas' },
  { chave: 'cancelada', rotulo: 'Canceladas' }
]

const STATUS_INFO = {
  concluida: { rotulo: 'Concluída', classe: 'status-concluida' },
  andamento: { rotulo: 'Em andamento', classe: 'status-andamento' },
  cancelada: { rotulo: 'Cancelada', classe: 'status-cancelada' }
}

function formatarData(dataISO) {
  const data = new Date(`${dataISO}T00:00:00`)
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function formatarValor(valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

function Historico() {
  const [tipoUsuario, setTipoUsuario] = useState('usuario') 
  const [filtroAtivo, setFiltroAtivo] = useState('todas')
  const [busca, setBusca] = useState('')
  
  const [visualizacao, setVisualizacao] = useState('lista')
  const [viagemSelecionada, setViagemSelecionada] = useState(null)

  const esMotorista = tipoUsuario === 'motorista'

  const viagensFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    return VIAGENS_EXEMPLO
      .filter((viagem) =>
        filtroAtivo === 'todas' || viagem.status === filtroAtivo
      )
      .filter((viagem) => {
        if (!termo) {
          return true
        }

        const buscaNome = esMotorista 
          ? viagem.usuario?.toLowerCase().includes(termo)
          : viagem.motorista.toLowerCase().includes(termo)

        return (
          viagem.origem.toLowerCase().includes(termo) ||
          viagem.destino.toLowerCase().includes(termo) ||
          buscaNome
        )
      })
      .sort((a, b) => new Date(b.data) - new Date(a.data))
  }, [filtroAtivo, busca, esMotorista])

  const totalFinancas = useMemo(() => {
    return VIAGENS_EXEMPLO
      .filter((viagem) => viagem.status === 'concluida')
      .reduce((soma, viagem) => soma + viagem.valor, 0)
  }, [])

  if (visualizacao === 'detalhes' && viagemSelecionada) {
    return (
      <main className="historico-layout">
        <section className="detalhes-corrida-layout" style={{ background: '#ffffff', padding: '35px', borderRadius: '22px', border: '1px solid #e0e6dc', boxShadow: '0 10px 30px rgba(20,35,20,0.04)' }}>
          
          <button 
            type="button" 
            className="btn-entrar" 
            onClick={() => setVisualizacao('lista')}
            style={{ marginBottom: '30px', fontWeight: '800' }}
          >
            ← Voltar
          </button>

          <div style={{ display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '35px' }}>
            <div style={{ 
              width: '110px', 
              height: '110px', 
              borderRadius: '50%', 
              background: '#eef8e9', 
              border: '2px solid #4c9828',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '44px' 
            }}>
              {esMotorista ? '👤' : '👨‍✈️'}
            </div>

            <div style={{ flex: 1, minWidth: '250px' }}>
              <span className="viagem-info-rotulo" style={{ display: 'block', marginBottom: '4px' }}>
                {esMotorista ? 'Dados do Cliente' : 'Dados do Motorista'}
              </span>
              <h2 style={{ fontSize: '26px', color: '#172033', fontWeight: '800', marginBottom: '15px' }}>
                {esMotorista ? viagemSelecionada.usuario : viagemSelecionada.motorista}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <p><strong>Rota:</strong> {viagemSelecionada.origem} ➔ {viagemSelecionada.destino}</p>
                <p><strong>Data:</strong> {formatarData(viagemSelecionada.data)}</p>
                <p><strong>Transporte:</strong> {viagemSelecionada.veiculo}</p>
                <p><strong>Total da Corrida:</strong> <span style={{ color: '#4c9828', fontWeight: '800' }}>{formatarValor(viagemSelecionada.valor)}</span></p>
              </div>
            </div>

            <span className={`status-viagem ${STATUS_INFO[viagemSelecionada.status].classe}`}>
              {STATUS_INFO[viagemSelecionada.status].rotulo}
            </span>
          </div>

          <div style={{ 
            height: '300px', 
            background: '#f4f7f2', 
            border: '2px dashed #c9d5c3', 
            borderRadius: '16px', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#506078',
            gap: '10px'
          }}>
            <span style={{ fontSize: '32px' }}>🗺️</span>
            <strong style={{ color: '#172033' }}>Mapa do Percurso</strong>
            <p style={{ fontSize: '13px', color: '#667287' }}>[Espaço integrado ao GPS / Google Maps para traçar a rota do frete]</p>
          </div>

        </section>
      </main>
    )
  }
  return (
    <main className="historico-layout">

      <section className="historico-abas-perfil" style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>
        <button
          type="button"
          onClick={() => { setTipoUsuario('usuario'); setBusca(''); }}
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: !esMotorista ? '#2ecc71' : '#f0f0f0',
            color: !esMotorista ? '#fff' : '#333',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          Cliente
        </button>
        <button
          type="button"
          onClick={() => { setTipoUsuario('motorista'); setBusca(''); }}
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: esMotorista ? '#2ecc71' : '#f0f0f0',
            color: esMotorista ? '#fff' : '#333',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          Motorista
        </button>
      </section>

      <section className="historico-cabecalho">

        <div className="historico-titulo">
          <h2>{esMotorista ? 'Histórico de corridas' : 'Histórico de viagens'}</h2>
          <p>
            {esMotorista 
              ? 'Acompanhe seus fretes realizados, em andamento e cancelados'
              : 'Acompanhe suas viagens anteriores, em andamento e canceladas'
            }
          </p>
        </div>

        <div className="historico-resumo">
          <span>{esMotorista ? 'Total faturado em corridas' : 'Total gasto em viagens concluídas'}</span>
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
                  ? 'filtro-historico ativo'
                  : 'filtro-historico'
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
            placeholder={esMotorista ? "Buscar por cidade ou cliente" : "Buscar por cidade ou motorista"}
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            aria-label="Buscar viagens"
          />
        </div>

      </section>

      <section className="historico-lista">

        {viagensFiltradas.length === 0 && (
          <div className="historico-vazio">
            <p>Nenhuma viagem encontrada para esse filtro.</p>
          </div>
        )}

        {viagensFiltradas.map((viagem) => {
          const status = STATUS_INFO[viagem.status]

          return (
            <article
              key={viagem.id}
              className="viagem-card"
              onClick={() => {
                setViagemSelecionada(viagem)
                setVisualizacao('detalhes')
              }}
              style={{ cursor: 'pointer' }}
            >

              <div className="viagem-rota">

                <div className="viagem-pontos">
                  <span className="ponto ponto-origem">
                    {viagem.origem}
                  </span>

                  <span className="viagem-seta">→</span>

                  <span className="ponto ponto-destino">
                    {viagem.destino}
                  </span>
                </div>

                <span className="viagem-data">
                  {formatarData(viagem.data)}
                </span>

              </div>

              <div className="viagem-detalhes">

                <div className="viagem-info">
                  <span className="viagem-info-rotulo">{esMotorista ? 'Cliente' : 'Motorista'}</span>
                  <span>{esMotorista ? (viagem.usuario || 'Cliente') : viagem.motorista}</span>
                </div>

                <div className="viagem-info">
                  <span className="viagem-info-rotulo">Veículo</span>
                  <span>{viagem.veiculo}</span>
                </div>

                <div className="viagem-info">
                  <span className="viagem-info-rotulo">{esMotorista ? 'Ganhos' : 'Valor'}</span>
                  <span>{formatarValor(viagem.valor)}</span>
                </div>

              </div>

              <span className={`status-viagem ${status.classe}`}>
                {status.rotulo}
              </span>

            </article>
          )
        })}

      </section>

    </main>
  )
}

export default Historico
