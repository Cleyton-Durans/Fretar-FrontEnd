import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const ESTADOS = [
  ["AC", "Acre"], ["AL", "Alagoas"], ["AP", "Amapá"], ["AM", "Amazonas"],
  ["BA", "Bahia"], ["CE", "Ceará"], ["DF", "Distrito Federal"],
  ["ES", "Espírito Santo"], ["GO", "Goiás"], ["MA", "Maranhão"],
  ["MT", "Mato Grosso"], ["MS", "Mato Grosso do Sul"], ["MG", "Minas Gerais"],
  ["PA", "Pará"], ["PB", "Paraíba"], ["PR", "Paraná"], ["PE", "Pernambuco"],
  ["PI", "Piauí"], ["RJ", "Rio de Janeiro"], ["RN", "Rio Grande do Norte"],
  ["RS", "Rio Grande do Sul"], ["RO", "Rondônia"], ["RR", "Roraima"],
  ["SC", "Santa Catarina"], ["SP", "São Paulo"], ["SE", "Sergipe"],
  ["TO", "Tocantins"],
];

const TIPOS_PIX = {
  cpf: { rotulo: "CPF", placeholder: "000.000.000-00" },
  email: { rotulo: "E-mail", placeholder: "seuemail@exemplo.com" },
  phone: { rotulo: "Celular", placeholder: "(00) 00000-0000" },
  random: { rotulo: "Chave aleatória", placeholder: "Cole a chave aleatória" },
};

function somenteDigitos(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function cpfValido(valor) {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  for (const tamanho of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < tamanho; i += 1) {
      soma += Number(cpf[i]) * (tamanho + 1 - i);
    }
    const digito = ((soma * 10) % 11) % 10;
    if (digito !== Number(cpf[tamanho])) return false;
  }
  return true;
}

// Devolve { chave } normalizada ou { erro } com a mensagem para o usuario.
function validarChavePix(tipo, valor) {
  const texto = String(valor || "").trim();

  if (tipo === "cpf") {
    return cpfValido(texto)
      ? { chave: somenteDigitos(texto) }
      : { erro: "CPF da chave Pix inválido." };
  }
  if (tipo === "email") {
    return /^\S+@\S+\.\S+$/.test(texto)
      ? { chave: texto.toLowerCase() }
      : { erro: "E-mail da chave Pix inválido." };
  }
  if (tipo === "phone") {
    const digitos = somenteDigitos(texto);
    return digitos.length === 10 || digitos.length === 11
      ? { chave: digitos }
      : { erro: "Celular da chave Pix inválido (use DDD + número)." };
  }
  return /^[0-9a-fA-F-]{32,36}$/.test(texto)
    ? { chave: texto.toLowerCase() }
    : { erro: "Chave aleatória inválida (32 a 36 caracteres)." };
}

function montarEndereco(dados) {
  return [
    [dados.endereco, dados.numero].filter(Boolean).join(", "),
    [dados.cidade, dados.estado].filter(Boolean).join("/"),
    dados.cep ? `CEP ${dados.cep}` : "",
  ]
    .filter(Boolean)
    .join(" - ");
}

function Cadastro() {
  const navigate = useNavigate();

  const [tipoConta, setTipoConta] = useState("cliente");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [dados, setDados] = useState({
    nome: "",
    telefone: "",
    email: "",
    cpf: "",
    endereco: "",
    numero: "",
    cep: "",
    cidade: "",
    estado: "",
    senha: "",
    confirmarSenha: "",
    tipoVeiculo: "",
    placa: "",
    cnh: "",
    capacidade: "",
    tipoPix: "cpf",
    chavePix: "",
    termos: false,
  });

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [carregando, setCarregando] = useState(false);

  function alterarDados(event) {
    const { name, value, type, checked } = event.target;

    setDados((atual) => ({
      ...atual,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMensagem("");
    setTipoMensagem("");
  }

  function alternarTipoConta(tipo) {
    setTipoConta(tipo);
    setMensagem("");
    setTipoMensagem("");
  }

  const camposCliente = [
    dados.nome,
    dados.telefone,
    dados.email,
    dados.cpf,
    dados.endereco,
    dados.numero,
    dados.cep,
    dados.cidade,
    dados.estado,
    dados.senha,
    dados.confirmarSenha,
  ];

  const camposFreteiro = [
    dados.nome,
    dados.email,
    dados.cpf,
    dados.telefone,
    dados.cnh,
    dados.senha,
    dados.confirmarSenha,
    dados.tipoVeiculo,
    dados.placa,
    dados.capacidade,
    dados.endereco,
    dados.numero,
    dados.cep,
    dados.cidade,
    dados.estado,
    dados.chavePix,
  ];

  async function cadastrar(event) {
    event.preventDefault();

    const campos =
      tipoConta === "cliente" ? camposCliente : camposFreteiro;

    if (campos.some((campo) => String(campo).trim() === "")) {
      setMensagem("⚠️ Preencha todos os campos.");
      setTipoMensagem("erro");
      return;
    }

    if (dados.senha.length < 8) {
      setMensagem("⚠️ A senha deve ter pelo menos 8 caracteres.");
      setTipoMensagem("erro");
      return;
    }

    if (dados.senha !== dados.confirmarSenha) {
      setMensagem("⚠️ As senhas não são iguais.");
      setTipoMensagem("erro");
      return;
    }

    let pix = null;
    if (tipoConta !== "cliente") {
      pix = validarChavePix(dados.tipoPix, dados.chavePix);
      if (pix.erro) {
        setMensagem(`⚠️ ${pix.erro}`);
        setTipoMensagem("erro");
        return;
      }
    }

    if (tipoConta === "cliente" && !dados.termos) {
      setMensagem(
        "⚠️ Você precisa aceitar os Termos de Uso e a Política de Privacidade."
      );
      setTipoMensagem("erro");
      return;
    }

    setCarregando(true);
    setMensagem("");

    try {
      if (tipoConta === "cliente") {
        await api("/auth/register/user", {
          metodo: "POST",
          corpo: {
            name: dados.nome,
            email: dados.email,
            password: dados.senha,
            password_confirmation: dados.confirmarSenha,
            phone: dados.telefone,
            address: montarEndereco(dados),
          },
          comAuth: false,
        });
      } else {
        await api("/auth/register/driver", {
          metodo: "POST",
          corpo: {
            name: dados.nome,
            email: dados.email,
            password: dados.senha,
            password_confirmation: dados.confirmarSenha,
            phone: dados.telefone,
            address: montarEndereco(dados),
            pix_key_type: dados.tipoPix,
            pix_key: pix.chave,
            cnh: dados.cnh,
            vehicle_type: dados.tipoVeiculo,
            license_plate: dados.placa,
            capacity_load_kg: Number(dados.capacidade),
          },
          comAuth: false,
        });
      }

      setTipoMensagem("sucesso");
      setMensagem(
        `${tipoConta === "cliente" ? "Cliente" : "Freteiro"} cadastrado com sucesso! Agora é só fazer login.`
      );

      setDados((atual) => ({
        ...atual,
        senha: "",
        confirmarSenha: "",
      }));

      setTimeout(() => navigate("/login"), 1500);
    } catch (erro) {
      setTipoMensagem("erro");
      setMensagem(erro.message);
    } finally {
      setCarregando(false);
    }
  }

  async function buscarCep() {
    const cep = dados.cep.replace(/\D/g, "");

    if (cep.length !== 8) {
      setMensagem("⚠️ Digite um CEP válido (8 dígitos).");
      setTipoMensagem("erro");
      return;
    }

    setBuscandoCep(true);
    setMensagem("");

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const endereco = await resposta.json();

      if (endereco.erro) {
        throw new Error("CEP não encontrado");
      }

      setDados((atual) => ({
        ...atual,
        endereco: endereco.logradouro || atual.endereco,
        cidade: endereco.localidade || atual.cidade,
        estado: endereco.uf || atual.estado,
      }));

      setTipoMensagem("sucesso");
      setMensagem(
        `✓ Endereço encontrado: ${endereco.logradouro}, ${endereco.localidade}/${endereco.uf}`
      );
    } catch {
      setTipoMensagem("erro");
      setMensagem("Não foi possível buscar o CEP. Verifique e tente novamente.");
    } finally {
      setBuscandoCep(false);
    }
  }

  const ehCliente = tipoConta === "cliente";

  return (
    <main className="cadastro-layout">
      <section className="cadastro-card cadastro-grande">
        <div className="cadastro-titulo">
          <h2>Criar conta</h2>
          <p>Escolha como deseja usar a plataforma</p>
        </div>

        <div className="cadastro-tipos">
          <button
            type="button"
            className={ehCliente ? "tipo-conta ativo" : "tipo-conta"}
            onClick={() => alternarTipoConta("cliente")}
          >
            👤 Sou cliente
          </button>
          <button
            type="button"
            className={!ehCliente ? "tipo-conta ativo" : "tipo-conta"}
            onClick={() => alternarTipoConta("freteiro")}
          >
            🚚 Sou freteiro
          </button>
        </div>

        {mensagem && (
          <div className={`mensagem-cadastro ${tipoMensagem}`}>{mensagem}</div>
        )}

        <form className="cadastro-formulario" onSubmit={cadastrar}>
          <div className="linha-cadastro">
            <div className="campo-cadastro">
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                name="nome"
                type="text"
                placeholder="Digite seu nome completo"
                value={dados.nome}
                onChange={alterarDados}
              />
            </div>

            <div className="campo-cadastro">
              <label htmlFor="telefone">Telefone</label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={dados.telefone}
                onChange={alterarDados}
              />
            </div>
          </div>

          <div className="linha-cadastro">
            <div className="campo-cadastro">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={dados.email}
                onChange={alterarDados}
              />
            </div>

            {ehCliente && (
              <div className="campo-cadastro">
                <label htmlFor="cpf">CPF</label>
                <input
                  id="cpf"
                  name="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={dados.cpf}
                  onChange={alterarDados}
                />
              </div>
            )}
          </div>

          <>
              <div className="linha-cadastro">
                <div className="campo-cadastro">
                  <label htmlFor="endereco">
                    {ehCliente ? "Endereço" : "Endereço (onde você atua)"}
                  </label>
                  <input
                    id="endereco"
                    name="endereco"
                    type="text"
                    placeholder="Rua, bairro"
                    value={dados.endereco}
                    onChange={alterarDados}
                  />
                </div>

                <div className="campo-cadastro">
                  <label htmlFor="numero">Número</label>
                  <input
                    id="numero"
                    name="numero"
                    type="text"
                    placeholder="123"
                    value={dados.numero}
                    onChange={alterarDados}
                  />
                </div>
              </div>

              <div className="linha-cadastro">
                <div className="campo-cadastro">
                  <label htmlFor="cep">CEP</label>
                  <div className="campo-senha">
                    <input
                      id="cep"
                      name="cep"
                      type="text"
                      placeholder="00000-000"
                      value={dados.cep}
                      onChange={alterarDados}
                    />
                    <button
                      type="button"
                      className="botao-olho"
                      onClick={buscarCep}
                      disabled={buscandoCep}
                      title="Buscar CEP"
                    >
                      {buscandoCep ? "⏳" : "🔍"}
                    </button>
                  </div>
                </div>

                <div className="campo-cadastro">
                  <label htmlFor="cidade">Cidade</label>
                  <input
                    id="cidade"
                    name="cidade"
                    type="text"
                    placeholder="Sua cidade"
                    value={dados.cidade}
                    onChange={alterarDados}
                  />
                </div>
              </div>

              <div className="linha-cadastro">
                <div className="campo-cadastro">
                  <label htmlFor="estado">Estado</label>
                  <select
                    id="estado"
                    name="estado"
                    value={dados.estado}
                    onChange={alterarDados}
                  >
                    <option value="">Selecione</option>
                    {ESTADOS.map(([sigla, nome]) => (
                      <option key={sigla} value={sigla}>
                        {nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
          </>

          {!ehCliente && (
            <div className="linha-cadastro">
              <div className="campo-cadastro">
                <label htmlFor="cnh">CNH</label>
                <input
                  id="cnh"
                  name="cnh"
                  type="text"
                  placeholder="00000000000"
                  value={dados.cnh}
                  onChange={alterarDados}
                />
              </div>

              <div className="campo-cadastro">
                <label htmlFor="capacidade">Capacidade de carga (kg)</label>
                <input
                  id="capacidade"
                  name="capacidade"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Ex.: 3000"
                  value={dados.capacidade}
                  onChange={alterarDados}
                />
              </div>
            </div>
          )}

          {!ehCliente && (
            <div className="linha-cadastro">
              <div className="campo-cadastro">
                <label htmlFor="tipoVeiculo">Tipo de veículo</label>
                <select
                  id="tipoVeiculo"
                  name="tipoVeiculo"
                  value={dados.tipoVeiculo}
                  onChange={alterarDados}
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
                <label htmlFor="placa">Placa</label>
                <input
                  id="placa"
                  name="placa"
                  type="text"
                  placeholder="ABC-1234"
                  value={dados.placa}
                  onChange={alterarDados}
                />
              </div>
            </div>
          )}

          {!ehCliente && (
            <div className="pix-bloco">
              <h4>💸 Como você quer receber?</h4>
              <p className="pix-nota">
                Cadastre sua chave Pix para receber os pagamentos dos fretes.
              </p>

              <div className="linha-cadastro">
                <div className="campo-cadastro">
                  <label htmlFor="tipoPix">Tipo da chave Pix</label>
                  <select
                    id="tipoPix"
                    name="tipoPix"
                    value={dados.tipoPix}
                    onChange={alterarDados}
                  >
                    {Object.entries(TIPOS_PIX).map(([valor, info]) => (
                      <option key={valor} value={valor}>
                        {info.rotulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="campo-cadastro">
                  <label htmlFor="chavePix">Chave Pix</label>
                  <input
                    id="chavePix"
                    name="chavePix"
                    type="text"
                    placeholder={TIPOS_PIX[dados.tipoPix].placeholder}
                    value={dados.chavePix}
                    onChange={alterarDados}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="linha-cadastro">
            <div className="campo-cadastro">
              <label htmlFor="senha">Criar uma senha</label>
              <div className="campo-senha">
                <input
                  id="senha"
                  name="senha"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={dados.senha}
                  onChange={alterarDados}
                />
                <button
                  type="button"
                  className="botao-olho"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  {mostrarSenha ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <div className="campo-cadastro">
              <label htmlFor="confirmarSenha">Confirmar senha</label>
              <div className="campo-senha">
                <input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type={mostrarConfirmacao ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  value={dados.confirmarSenha}
                  onChange={alterarDados}
                />
                <button
                  type="button"
                  className="botao-olho"
                  onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
                >
                  {mostrarConfirmacao ? "🙈" : "👁"}
                </button>
              </div>
            </div>
          </div>

          {ehCliente && (
            <label className="termos-cadastro">
              <input
                type="checkbox"
                name="termos"
                checked={dados.termos}
                onChange={alterarDados}
              />
              <span>
                Li e aceito os <a href="#termos">Termos de Uso</a> e a{" "}
                <Link to="/privacidade">Política de Privacidade</Link>
              </span>
            </label>
          )}

          <button type="submit" className="btn-cadastrar" disabled={carregando}>
            {carregando
              ? "Cadastrando..."
              : ehCliente
                ? "👤 Cadastrar"
                : "🚚 Cadastrar"}
          </button>
        </form>

        <div className="login-link">
          <span>Já tem uma conta? </span>
          <Link to="/login">Faça login</Link>
        </div>
      </section>
    </main>
  );
}

export default Cadastro;