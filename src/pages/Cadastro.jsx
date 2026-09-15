import { useState } from 'react'

import logoFretar from '../assets/logo-fretar.png'
import logoFretarClaro from '../assets/logo-fretar-claro.png'

function Cadastro({ onLogin, tema }) {
  const [tipoConta, setTipoConta] = useState('cliente')

  const [mensagem, setMensagem] = useState('')
  const [tipoMensagem, setTipoMensagem] = useState('')

  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false)

  const [buscandoCep, setBuscandoCep] = useState(false)

  const [cliente, setCliente] = useState({
    nome: '',
    telefone: '',
    email: '',
    cpf: '',
    endereco: '',
    numero: '',
    complemento: '',
    cep: '',
    cidade: '',
    estado: '',
    senha: '',
    confirmarSenha: '',
    termos: false
  })

  const [freteiro, setFreteiro] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    endereco: '',
    numero: '',
    complemento: '',
    cep: '',
    cidade: '',
    estado: '',
    senha: '',
    confirmarSenha: '',
    tipoVeiculo: '',
    placa: '',
    renavam: ''
  })

  /*
    MODO ESCURO:
    logo-fretar.png

    MODO CLARO:
    logo-fretar-claro.png
  */

  const logoAtual =
    tema === 'escuro'
      ? logoFretar
      : logoFretarClaro

  function alterarCliente(event) {
    const {
      name,
      value,
      type,
      checked
    } = event.target

    let novoValor =
      type === 'checkbox'
        ? checked
        : value

    if (name === 'cep') {
      const cepLimpo = value
        .replace(/\D/g, '')
        .slice(0, 8)

      novoValor =
        cepLimpo.length > 5
          ? `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`
          : cepLimpo
    }

    setCliente({
      ...cliente,
      [name]: novoValor
    })

    setMensagem('')
    setTipoMensagem('')
  }

  function alterarFreteiro(event) {
    const {
      name,
      value
    } = event.target

    let novoValor = value

    if (name === 'cep') {
      const cepLimpo = value
        .replace(/\D/g, '')
        .slice(0, 8)

      novoValor =
        cepLimpo.length > 5
          ? `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`
          : cepLimpo
    }

    if (name === 'renavam') {
      novoValor = value
        .replace(/\D/g, '')
        .slice(0, 11)
    }

    setFreteiro({
      ...freteiro,
      [name]: novoValor
    })

    setMensagem('')
    setTipoMensagem('')
  }

  function trocarTipoConta(tipo) {
    setTipoConta(tipo)
    setMensagem('')
    setTipoMensagem('')
  }

  function cadastrarCliente(event) {
    event.preventDefault()

    const camposObrigatorios = [
      cliente.nome,
      cliente.telefone,
      cliente.email,
      cliente.cpf,
      cliente.endereco,
      cliente.numero,
      cliente.cep,
      cliente.cidade,
      cliente.estado,
      cliente.senha,
      cliente.confirmarSenha
    ]

    const algumCampoVazio =
      camposObrigatorios.some(
        (campo) => campo.trim() === ''
      )

    if (algumCampoVazio) {
      setMensagem(
        '⚠️ Preencha todos os campos obrigatórios.'
      )

      setTipoMensagem('erro')
      return
    }

    if (cliente.cep.replace(/\D/g, '').length !== 8) {
      setMensagem(
        '⚠️ Digite um CEP válido com 8 números.'
      )

      setTipoMensagem('erro')
      return
    }

    if (!cliente.termos) {
      setMensagem(
        '⚠️ Você precisa aceitar os Termos de Uso e a Política de Privacidade.'
      )

      setTipoMensagem('erro')
      return
    }

    if (cliente.senha.length < 6) {
      setMensagem(
        '⚠️ A senha deve ter pelo menos 6 caracteres.'
      )

      setTipoMensagem('erro')
      return
    }

    if (
      cliente.senha !==
      cliente.confirmarSenha
    ) {
      setMensagem(
        '⚠️ As senhas não são iguais.'
      )

      setTipoMensagem('erro')
      return
    }

    setMensagem(
      '✓ Cadastro de cliente válido!'
    )

    setTipoMensagem('sucesso')
  }

  function cadastrarFreteiro(event) {
    event.preventDefault()

    const camposObrigatorios = [
      freteiro.nome,
      freteiro.email,
      freteiro.telefone,
      freteiro.cpf,
      freteiro.endereco,
      freteiro.numero,
      freteiro.cep,
      freteiro.cidade,
      freteiro.estado,
      freteiro.senha,
      freteiro.confirmarSenha,
      freteiro.tipoVeiculo,
      freteiro.placa,
      freteiro.renavam
    ]

    const algumCampoVazio =
      camposObrigatorios.some(
        (campo) => campo.trim() === ''
      )

    if (algumCampoVazio) {
      setMensagem(
        '⚠️ Preencha todos os campos obrigatórios.'
      )

      setTipoMensagem('erro')
      return
    }

    if (freteiro.cep.replace(/\D/g, '').length !== 8) {
      setMensagem(
        '⚠️ Digite um CEP válido com 8 números.'
      )

      setTipoMensagem('erro')
      return
    }

    if (freteiro.renavam.length !== 11) {
      setMensagem(
        '⚠️ O RENAVAM deve ter 11 números.'
      )

      setTipoMensagem('erro')
      return
    }

    if (freteiro.senha.length < 6) {
      setMensagem(
        '⚠️ A senha deve ter pelo menos 6 caracteres.'
      )

      setTipoMensagem('erro')
      return
    }

    if (
      freteiro.senha !==
      freteiro.confirmarSenha
    ) {
      setMensagem(
        '⚠️ As senhas não são iguais.'
      )

      setTipoMensagem('erro')
      return
    }

    setMensagem(
      '✓ Cadastro de freteiro válido!'
    )

    setTipoMensagem('sucesso')
  }

  async function buscarCepCliente() {
    const cepLimpo = cliente.cep.replace(
      /\D/g,
      ''
    )

    if (cepLimpo.length !== 8) {
      setMensagem(
        '⚠️ Digite um CEP válido com 8 números.'
      )

      setTipoMensagem('erro')
      return
    }

    setBuscandoCep(true)
    setMensagem('')
    setTipoMensagem('')

    try {
      const resposta = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      )

      if (!resposta.ok) {
        throw new Error(
          'Erro ao consultar o CEP.'
        )
      }

      const dados = await resposta.json()

      if (dados.erro) {
        setMensagem(
          '⚠️ CEP não encontrado.'
        )

        setTipoMensagem('erro')
        return
      }

      setCliente({
        ...cliente,

        cep:
          `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`,

        endereco:
          dados.logradouro || '',

        cidade:
          dados.localidade || '',

        estado:
          dados.uf || ''
      })

      setMensagem(
        '✓ CEP encontrado! Endereço preenchido automaticamente.'
      )

      setTipoMensagem('sucesso')

    } catch {
      setMensagem(
        '❌ Não foi possível consultar o CEP. Verifique sua conexão e tente novamente.'
      )

      setTipoMensagem('erro')

    } finally {
      setBuscandoCep(false)
    }
  }

  async function buscarCepFreteiro() {
    const cepLimpo = freteiro.cep.replace(
      /\D/g,
      ''
    )

    if (cepLimpo.length !== 8) {
      setMensagem(
        '⚠️ Digite um CEP válido com 8 números.'
      )

      setTipoMensagem('erro')
      return
    }

    setBuscandoCep(true)
    setMensagem('')
    setTipoMensagem('')

    try {
      const resposta = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      )

      if (!resposta.ok) {
        throw new Error(
          'Erro ao consultar o CEP.'
        )
      }

      const dados = await resposta.json()

      if (dados.erro) {
        setMensagem(
          '⚠️ CEP não encontrado.'
        )

        setTipoMensagem('erro')
        return
      }

      setFreteiro({
        ...freteiro,

        cep:
          `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`,

        endereco:
          dados.logradouro || '',

        cidade:
          dados.localidade || '',

        estado:
          dados.uf || ''
      })

      setMensagem(
        '✓ CEP encontrado! Endereço preenchido automaticamente.'
      )

      setTipoMensagem('sucesso')

    } catch {
      setMensagem(
        '❌ Não foi possível consultar o CEP. Verifique sua conexão e tente novamente.'
      )

      setTipoMensagem('erro')

    } finally {
      setBuscandoCep(false)
    }
  }

  return (
    <main className="cadastro-layout">

      <section className="cadastro-apresentacao">

        <div className="cadastro-marca">

          <img
            src={logoAtual}
            alt="Fretar"
            className="logo-cadastro"
          />

        </div>

        <span className="cadastro-destaque">
          CRIE SUA CONTA, É RÁPIDO E FÁCIL
        </span>

        <h1>
          Cadastre-se
          <span>sem Fretar.</span>
        </h1>

        <p className="cadastro-descricao">
          Conectamos quem precisa enviar com motoristas
          de confiança. Rápido, seguro e transparente.
        </p>

        <div className="cadastro-beneficios">

          <div className="cadastro-beneficio">

            <div className="cadastro-icone">
              ✓
            </div>

            <div>

              <strong>
                Seguro
              </strong>

              <span>
                Seus dados protegidos com segurança.
              </span>

            </div>

          </div>

          <div className="cadastro-beneficio">

            <div className="cadastro-icone">
              ⚡
            </div>

            <div>

              <strong>
                Rápido
              </strong>

              <span>
                Cadastro simples e rápido.
              </span>

            </div>

          </div>

          <div className="cadastro-beneficio">

            <div className="cadastro-icone">
              🚚
            </div>

            <div>

              <strong>
                Confiável
              </strong>

              <span>
                Encontre as melhores soluções para seus fretes.
              </span>

            </div>

          </div>

        </div>

      </section>

      <section className="cadastro-card">

        <div className="cadastro-titulo">

          <h2>
            Criar conta
          </h2>

          <p>
            Escolha como deseja usar a plataforma
          </p>

        </div>

        <div className="cadastro-tipos">

          <button
            type="button"
            className={
              tipoConta === 'cliente'
                ? 'tipo-conta ativo'
                : 'tipo-conta'
            }
            onClick={() =>
              trocarTipoConta('cliente')
            }
          >
            👤 Sou cliente
          </button>

          <button
            type="button"
            className={
              tipoConta === 'freteiro'
                ? 'tipo-conta ativo'
                : 'tipo-conta'
            }
            onClick={() =>
              trocarTipoConta('freteiro')
            }
          >
            🚚 Sou freteiro
          </button>

        </div>

        {mensagem && (
          <div
            className={`mensagem-cadastro ${tipoMensagem}`}
          >
            {mensagem}
          </div>
        )}

        {tipoConta === 'cliente' && (

          <div className="cadastro-formulario">

            <div className="titulo-formulario">

              <div className="icone-titulo">
                👤
              </div>

              <div>

                <h2>
                  Cadastro de Cliente
                </h2>

                <p>
                  Preencha seus dados pessoais
                </p>

              </div>

            </div>

            <form onSubmit={cadastrarCliente}>

              <div className="linha-cadastro">

                <div className="campo-cadastro">

                  <label htmlFor="clienteNome">
                    Nome completo
                  </label>

                  <input
                    id="clienteNome"
                    name="nome"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={cliente.nome}
                    onChange={alterarCliente}
                  />

                </div>

                <div className="campo-cadastro">

                  <label htmlFor="clienteTelefone">
                    Telefone
                  </label>

                  <input
                    id="clienteTelefone"
                    name="telefone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={cliente.telefone}
                    onChange={alterarCliente}
                  />

                </div>

              </div>

              <div className="linha-cadastro">

                <div className="campo-cadastro">

                  <label htmlFor="clienteEmail">
                    E-mail
                  </label>

                  <input
                    id="clienteEmail"
                    name="email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={cliente.email}
                    onChange={alterarCliente}
                  />

                </div>

                <div className="campo-cadastro">

                  <label htmlFor="clienteCpf">
                    CPF
                  </label>

                  <input
                    id="clienteCpf"
                    name="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={cliente.cpf}
                    onChange={alterarCliente}
                  />

                </div>

              </div>

              <div className="linha-cadastro">

                <div className="campo-cadastro campo-grande">

                  <label htmlFor="clienteEndereco">
                    Endereço
                  </label>

                  <input
                    id="clienteEndereco"
                    name="endereco"
                    type="text"
                    placeholder="Rua, bairro"
                    value={cliente.endereco}
                    onChange={alterarCliente}
                  />

                </div>

                <div className="campo-cadastro">

                  <label htmlFor="clienteNumero">
                    Número
                  </label>

                  <input
                    id="clienteNumero"
                    name="numero"
                    type="text"
                    placeholder="123"
                    value={cliente.numero}
                    onChange={alterarCliente}
                  />

                </div>

              </div>

              <div className="linha-cadastro">

                <div className="campo-cadastro">

                  <label htmlFor="clienteComplemento">
                    Complemento <span>(opcional)</span>
                  </label>

                  <input
                    id="clienteComplemento"
                    name="complemento"
                    type="text"
                    placeholder="Apartamento, bloco..."
                    value={cliente.complemento}
                    onChange={alterarCliente}
                  />

                </div>

                <div className="campo-cadastro">

                  <label htmlFor="clienteCep">
                    CEP
                  </label>

                  <input
                    id="clienteCep"
                    name="cep"
                    type="text"
                    placeholder="00000-000"
                    value={cliente.cep}
                    onChange={alterarCliente}
                    maxLength="9"
                    inputMode="numeric"
                  />

                </div>

              </div>

              <div className="cep-botao-container">

                <button
                  type="button"
                  className="btn-cep"
                  onClick={buscarCepCliente}
                  disabled={buscandoCep}
                >
                  {buscandoCep
                    ? 'Buscando...'
                    : 'Buscar CEP'}
                </button>

              </div>

              <div className="linha-cadastro">

                <div className="campo-cadastro">

                  <label htmlFor="clienteCidade">
                    Cidade
                  </label>

                  <input
                    id="clienteCidade"
                    name="cidade"
                    type="text"
                    placeholder="Sua cidade"
                    value={cliente.cidade}
                    onChange={alterarCliente}
                  />

                </div>

                <div className="campo-cadastro">

                  <label htmlFor="clienteEstado">
                    Estado
                  </label>

                  <select
                    id="clienteEstado"
                    name="estado"
                    value={cliente.estado}
                    onChange={alterarCliente}
                  >

                    <option value="">
                      Selecione
                    </option>

                    <option value="RS">
                      Rio Grande do Sul
                    </option>

                    <option value="SC">
                      Santa Catarina
                    </option>

                    <option value="PR">
                      Paraná
                    </option>

                    <option value="SP">
                      São Paulo
                    </option>

                  </select>

                </div>

              </div>

              <div className="linha-cadastro">

                <div className="campo-cadastro">

                  <label htmlFor="clienteSenha">
                    Criar uma senha
                  </label>

                  <div className="campo-senha">

                    <input
                      id="clienteSenha"
                      name="senha"
                      type={
                        mostrarSenha
                          ? 'text'
                          : 'password'
                      }
                      placeholder="Mínimo 6 caracteres"
                      value={cliente.senha}
                      onChange={alterarCliente}
                    />

                    <button
                      type="button"
                      className="botao-olho"
                      onClick={() =>
                        setMostrarSenha(
                          !mostrarSenha
                        )
                      }
                    >
                      {mostrarSenha
                        ? '🙈'
                        : '👁'}
                    </button>

                  </div>

                </div>

                <div className="campo-cadastro">

                  <label htmlFor="clienteConfirmarSenha">
                    Confirmar senha
                  </label>

                  <div className="campo-senha">

                    <input
                      id="clienteConfirmarSenha"
                      name="confirmarSenha"
                      type={
                        mostrarConfirmacao
                          ? 'text'
                          : 'password'
                      }
                      placeholder="Confirme sua senha"
                      value={cliente.confirmarSenha}
                      onChange={alterarCliente}
                    />

                    <button
                      type="button"
                      className="botao-olho"
                      onClick={() =>
                        setMostrarConfirmacao(
                          !mostrarConfirmacao
                        )
                      }
                    >
                      {mostrarConfirmacao
                        ? '🙈'
                        : '👁'}
                    </button>

                  </div>

                </div>

              </div>

              <label className="termos-cadastro">

                <input
                  type="checkbox"
                  name="termos"
                  checked={cliente.termos}
                  onChange={alterarCliente}
                />

                <span>
                  Li e aceito os{' '}

                  <a href="#termos">
                    Termos de Uso
                  </a>{' '}

                  e a{' '}

                  <a href="#privacidade">
                    Política de Privacidade
                  </a>
                </span>

              </label>

              <button
                type="submit"
                className="btn-cadastrar"
              >
                👤 Cadastrar
              </button>

            </form>

            <div className="login-link">

              <span>
                Já tem uma conta?{' '}
              </span>

              <button
                type="button"
                onClick={onLogin}
              >
                Faça login
              </button>

            </div>

          </div>

        )}

        {tipoConta === 'freteiro' && (

          <div className="cadastro-formulario">

            <div className="titulo-formulario">

              <div className="icone-titulo">
                🚚
              </div>

              <div>

                <h2>
                  Cadastro de Freteiro
                </h2>

                <p>
                  Cadastre seus dados e seu veículo
                </p>

              </div>

            </div>

            <form onSubmit={cadastrarFreteiro}>

              <div className="linha-cadastro">

                <div className="campo-cadastro">

                  <label htmlFor="freteiroNome">
                    Nome completo
                  </label>

                  <input
                    id="freteiroNome"
                    name="nome"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={freteiro.nome}
                    onChange={alterarFreteiro}
                  />

                </div>

                <div className="campo-cadastro">

                  <label htmlFor="freteiroEmail">
                    E-mail
                  </label>

                  <input
                    id="freteiroEmail"
                    name="email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={freteiro.email}
                    onChange={alterarFreteiro}
                  />

                </div>

              </div>

              <div className="linha-cadastro">

                <div className="campo-cadastro">

                  <label htmlFor="freteiroTelefone">
                    Telefone
                  </label>

                  <input
                    id="freteiroTelefone"
                    name="telefone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={freteiro.telefone}
                    onChange={alterarFreteiro}
                  />

                </div>

                <div className="campo-cadastro">

                  <label htmlFor="freteiroCpf">
                    CPF
                  </label>

                  <input
                    id="freteiroCpf"
                    name="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={freteiro.cpf}
                    onChange={alterarFreteiro}
                  />

                </div>

              </div>

              <div className="linha-cadastro">

                <div className="campo-cadastro campo-grande">

                  <label htmlFor="freteiroEndereco">
                    Endereço
                  </label>

                  <input
                    id="freteiroEndereco"
                    name="endereco"
                    type="text"
                    placeholder="Rua, bairro"
                    value={freteiro.endereco}
                    onChange={alterarFreteiro}
                  />

                </div>

                <div className="campo-cadastro">

                  <label htmlFor="freteiroNumero">
                    Número
                  </label>

                  <input
                    id="freteiroNumero"
                    name="numero"
                    type="text"
                    placeholder="123"
                    value={freteiro.numero}
                    onChange={alterarFreteiro}
                  />

                </div>

              </div>

              <div className="linha-cadastro">

                <div className="campo-cadastro">

                  <label htmlFor="freteiroComplemento">
                    Complemento <span>(opcional)</span>
                  </label>

                  <input
                    id="freteiroComplemento"
                    name="complemento"
                    type="text"
                    placeholder="Apartamento, bloco..."
                    value={freteiro.complemento}
                    onChange={alterarFreteiro}
                  />

                </div>

                <div className="campo-cadastro">

                  <label htmlFor="freteiroCep">
                    CEP
                  </label>

                  <input
                    id="freteiroCep"
                    name="cep"
                    type="text"
                    placeholder="00000-000"
                    value={freteiro.cep}
                    onChange={alterarFreteiro}
                    maxLength="9"
                    inputMode="numeric"
                  />

                </div>

              </div>

              <div className="cep-botao-container">

                <button
                  type="button"
                  className="btn-cep"
                  onClick={buscarCepFreteiro}
                  disabled={buscandoCep}
                >
                  {buscandoCep
                    ? 'Buscando...'
                    : 'Buscar CEP'}
                </button>

              </div>

              <div className="linha-cadastro">

                <div className="campo-cadastro">

                  <label htmlFor="freteiroCidade">
                    Cidade
                  </label>

                  <input
                    id="freteiroCidade"
                    name="cidade"
                    type="text"
                    placeholder="Sua cidade"
                    value={freteiro.cidade}
                    onChange={alterarFreteiro}
                  />

                </div>

                <div className="campo-cadastro">

                  <label htmlFor="freteiroEstado">
                    Estado
                  </label>

                  <select
                    id="freteiroEstado"
                    name="estado"
                    value={freteiro.estado}
                    onChange={alterarFreteiro}
                  >

                    <option value="">
                      Selecione
                    </option>

                    <option value="RS">
                      Rio Grande do Sul
                    </option>

                    <option value="SC">
                      Santa Catarina
                    </option>

                    <option value="PR">
                      Paraná
                    </option>

                    <option value="SP">
                      São Paulo
                    </option>

                  </select>

                </div>

              </div>

              <div className="linha-cadastro">

                <div className="campo-cadastro">

                  <label htmlFor="freteiroSenha">
                    Senha
                  </label>

                  <div className="campo-senha">

                    <input
                      id="freteiroSenha"
                      name="senha"
                      type={
                        mostrarSenha
                          ? 'text'
                          : 'password'
                      }
                      placeholder="Mínimo 6 caracteres"
                      value={freteiro.senha}
                      onChange={alterarFreteiro}
                    />

                    <button
                      type="button"
                      className="botao-olho"
                      onClick={() =>
                        setMostrarSenha(
                          !mostrarSenha
                        )
                      }
                    >
                      {mostrarSenha
                        ? '🙈'
                        : '👁'}
                    </button>

                  </div>

                </div>

                <div className="campo-cadastro">

                  <label htmlFor="freteiroConfirmarSenha">
                    Confirmar senha
                  </label>

                  <div className="campo-senha">

                    <input
                      id="freteiroConfirmarSenha"
                      name="confirmarSenha"
                      type={
                        mostrarConfirmacao
                          ? 'text'
                          : 'password'
                      }
                      placeholder="Confirme sua senha"
                      value={freteiro.confirmarSenha}
                      onChange={alterarFreteiro}
                    />

                    <button
                      type="button"
                      className="botao-olho"
                      onClick={() =>
                        setMostrarConfirmacao(
                          !mostrarConfirmacao
                        )
                      }
                    >
                      {mostrarConfirmacao
                        ? '🙈'
                        : '👁'}
                    </button>

                  </div>

                </div>

              </div>

              <div className="linha-cadastro">

                <div className="campo-cadastro">

                  <label htmlFor="tipoVeiculo">
                    Tipo de veículo
                  </label>

                  <select
                    id="tipoVeiculo"
                    name="tipoVeiculo"
                    value={freteiro.tipoVeiculo}
                    onChange={alterarFreteiro}
                  >

                    <option value="">
                      Selecione
                    </option>

                    <option value="moto">
                      Moto
                    </option>

                    <option value="carro">
                      Carro
                    </option>

                    <option value="caminhonete">
                      Caminhonete
                    </option>

                    <option value="van">
                      Van
                    </option>

                    <option value="caminhao">
                      Caminhão
                    </option>

                  </select>

                </div>

                <div className="campo-cadastro">

                  <label htmlFor="freteiroPlaca">
                    Placa
                  </label>

                  <input
                    id="freteiroPlaca"
                    name="placa"
                    type="text"
                    placeholder="ABC-1234"
                    value={freteiro.placa}
                    onChange={alterarFreteiro}
                  />

                </div>

              </div>

              <div className="linha-cadastro">

                <div className="campo-cadastro campo-grande">

                  <label htmlFor="freteiroRenavam">
                    RENAVAM
                  </label>

                  <input
                    id="freteiroRenavam"
                    name="renavam"
                    type="text"
                    placeholder="Digite o RENAVAM do veículo"
                    value={freteiro.renavam}
                    onChange={alterarFreteiro}
                    maxLength="11"
                    inputMode="numeric"
                  />

                </div>

              </div>

              <button
                type="submit"
                className="btn-cadastrar"
              >
                🚚 Cadastrar
              </button>

            </form>

            <div className="login-link">

              <span>
                Já tem uma conta?{' '}
              </span>

              <button
                type="button"
                onClick={onLogin}
              >
                Faça login
              </button>

            </div>

          </div>

        )}

      </section>

    </main>
  )
}

export default Cadastro