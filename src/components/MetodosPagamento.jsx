import { useCallback, useEffect, useState } from "react";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { api } from "../lib/api";
import { obterStripe, stripeAtivo, stripeModoTeste } from "../lib/stripe";
import {
  TIPOS_PAGAMENTO,
  bandeiraDoCartao,
  formatarNumeroCartao,
  formatarValidade,
  iconeMetodo,
  novoIdMetodo,
  numeroCartaoValido,
  rotuloMetodo,
  somenteDigitos,
  validadeValida,
} from "../lib/pagamento";

const CARTAO_VAZIO = { numero: "", nome: "", validade: "", cvv: "" };

function extrairLista(dados) {
  if (Array.isArray(dados)) return dados;
  return dados?.data || [];
}

const OPCOES_CAMPO_CARTAO = {
  hidePostalCode: true,
  style: {
    base: {
      fontSize: "16px",
      color: "#172033",
      "::placeholder": { color: "#9aa5a0" },
    },
  },
};

// Formulario de cartao da Stripe: os dados do cartao vao DIRETO para a Stripe
// (iframe deles) e so o identificador pm_... chega ao nosso servidor.
function CartaoStripe({ aoCriar, salvando, erro, setErro }) {
  const stripe = useStripe();
  const elements = useElements();
  const [nome, setNome] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setErro("");

    if (!stripe || !elements) {
      setErro("A Stripe ainda está carregando. Tente de novo em instantes.");
      return;
    }

    if (nome.trim().length < 3) {
      setErro("Informe o nome impresso no cartão.");
      return;
    }

    const campo = elements.getElement(CardElement);

    if (!campo) {
      setErro("Campo do cartão indisponível. Atualize a página.");
      return;
    }

    setEnviando(true);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: campo,
      billing_details: { name: nome.trim() },
    });
    setEnviando(false);

    if (error) {
      setErro(error.message || "Cartão inválido.");
      return;
    }

    await aoCriar({
      stripe_payment_method_id: paymentMethod.id,
      type: "card",
      last_4_digits: paymentMethod.card?.last4 ?? null,
      card_brand: paymentMethod.card?.brand ?? null,
    });
  }

  return (
    <>
      <div className="campo-cadastro">
        <label htmlFor="cartao-nome-stripe">Nome no cartão</label>
        <input
          id="cartao-nome-stripe"
          type="text"
          autoComplete="off"
          placeholder="Como está impresso"
          value={nome}
          onChange={(e) => {
            setErro("");
            setNome(e.target.value);
          }}
        />
      </div>

      <div className="campo-cadastro">
        <label>Dados do cartão</label>
        <div className="stripe-campo">
          <CardElement options={OPCOES_CAMPO_CARTAO} />
        </div>
      </div>

      <p className="pagamento-nota">
        {stripeModoTeste
          ? "Modo de teste da Stripe: use o cartão 4242 4242 4242 4242, uma validade futura e qualquer CVC. "
          : ""}
        Os dados do cartão vão direto para a Stripe e nunca passam pelo nosso
        servidor.
      </p>

      {erro && <p className="pagamento-erro">{erro}</p>}

      <button
        type="button"
        className="mapa-btn"
        disabled={salvando || enviando}
        onClick={enviar}
      >
        {salvando || enviando ? "Salvando..." : "Salvar cartão"}
      </button>
    </>
  );
}

// Escolha e cadastro da forma de pagamento do cliente (estilo "carteira").
// aoEscolher recebe o metodo selecionado (ou null).
function MetodosPagamento({ aoEscolher }) {
  const [metodos, setMetodos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [escolhidoId, setEscolhidoId] = useState(null);

  const [adicionando, setAdicionando] = useState(false);
  const [tipo, setTipo] = useState("card");
  const [cartao, setCartao] = useState(CARTAO_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    try {
      const lista = extrairLista(await api("/me/payment-methods"));
      setMetodos(lista);
      setEscolhidoId((atual) =>
        lista.some((m) => m.id === atual) ? atual : (lista[0]?.id ?? null)
      );
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    aoEscolher?.(metodos.find((m) => m.id === escolhidoId) || null);
  }, [metodos, escolhidoId, aoEscolher]);

  function alterarCartao(campo, valor) {
    setErro("");
    setCartao((atual) => ({ ...atual, [campo]: valor }));
  }

  async function registrarMetodo(corpo) {
    setSalvando(true);
    try {
      const novo = await api("/me/payment-methods", { metodo: "POST", corpo });
      await carregar();
      setEscolhidoId(novo.id);
      setCartao(CARTAO_VAZIO);
      setAdicionando(false);
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function salvar() {
    setErro("");
    let corpo;

    if (tipo === "card") {
      if (!numeroCartaoValido(cartao.numero)) {
        setErro("Número de cartão inválido.");
        return;
      }
      if (cartao.nome.trim().length < 3) {
        setErro("Informe o nome impresso no cartão.");
        return;
      }
      if (!validadeValida(cartao.validade)) {
        setErro("Validade inválida ou vencida (use MM/AA).");
        return;
      }
      const cvv = somenteDigitos(cartao.cvv);
      if (cvv.length < 3 || cvv.length > 4) {
        setErro("CVV inválido.");
        return;
      }

      const numero = somenteDigitos(cartao.numero);
      corpo = {
        stripe_payment_method_id: novoIdMetodo("card"),
        type: "card",
        last_4_digits: numero.slice(-4),
        card_brand: bandeiraDoCartao(numero),
      };
    } else {
      corpo = { stripe_payment_method_id: novoIdMetodo(tipo), type: tipo };
    }

    await registrarMetodo(corpo);
  }

  function aoDigitar(evento) {
    // Enter dentro do formulario do frete nao pode solicitar um frete sem querer.
    if (evento.key === "Enter") {
      evento.preventDefault();
      salvar();
    }
  }

  // com a Stripe ativa, o cartao usa o formulario seguro da Stripe
  const usandoStripe = stripeAtivo && tipo === "card";

  return (
    <div className="pagamento-bloco">
      <div className="pagamento-titulo">
        <strong>Forma de pagamento</strong>
        <button
          type="button"
          className="pagamento-link"
          onClick={() => {
            setAdicionando((v) => !v);
            setErro("");
          }}
        >
          {adicionando ? "Fechar" : "＋ Adicionar"}
        </button>
      </div>

      {carregando && <p className="pagamento-vazio">Carregando...</p>}

      {!carregando && metodos.length === 0 && !adicionando && (
        <p className="pagamento-vazio">
          Nenhuma forma de pagamento cadastrada. Adicione uma para pagar seus
          fretes.
        </p>
      )}

      {metodos.length > 0 && (
        <ul className="pagamento-lista">
          {metodos.map((metodo) => {
            const ativo = metodo.id === escolhidoId;
            return (
              <li key={metodo.id}>
                <label
                  className={ativo ? "pagamento-opcao ativo" : "pagamento-opcao"}
                >
                  <input
                    type="radio"
                    name="metodo-pagamento"
                    checked={ativo}
                    onChange={() => setEscolhidoId(metodo.id)}
                  />
                  <span className="pagamento-icone">{iconeMetodo(metodo)}</span>
                  <span className="pagamento-nome">{rotuloMetodo(metodo)}</span>
                  {metodo.type === "cash" && (
                    <span className="pagamento-detalhe">pago ao motorista</span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      )}

      {adicionando && (
        <div className="pagamento-form" onKeyDown={aoDigitar}>
          <div className="pagamento-tipos">
            {Object.entries(TIPOS_PAGAMENTO).map(([valor, info]) => (
              <button
                key={valor}
                type="button"
                className={tipo === valor ? "tipo-conta ativo" : "tipo-conta"}
                onClick={() => {
                  setTipo(valor);
                  setErro("");
                }}
              >
                {info.icone} {info.rotulo}
              </button>
            ))}
          </div>

          {tipo === "card" && !stripeAtivo && (
            <>
              <div className="campo-cadastro">
                <label htmlFor="cartao-numero">Número do cartão</label>
                <input
                  id="cartao-numero"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="0000 0000 0000 0000"
                  value={cartao.numero}
                  onChange={(e) =>
                    alterarCartao("numero", formatarNumeroCartao(e.target.value))
                  }
                />
              </div>

              <div className="campo-cadastro">
                <label htmlFor="cartao-nome">Nome no cartão</label>
                <input
                  id="cartao-nome"
                  type="text"
                  autoComplete="off"
                  placeholder="Como está impresso"
                  value={cartao.nome}
                  onChange={(e) => alterarCartao("nome", e.target.value)}
                />
              </div>

              <div className="linha-cadastro">
                <div className="campo-cadastro">
                  <label htmlFor="cartao-validade">Validade</label>
                  <input
                    id="cartao-validade"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="MM/AA"
                    value={cartao.validade}
                    onChange={(e) =>
                      alterarCartao("validade", formatarValidade(e.target.value))
                    }
                  />
                </div>

                <div className="campo-cadastro">
                  <label htmlFor="cartao-cvv">CVV</label>
                  <input
                    id="cartao-cvv"
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={4}
                    placeholder="•••"
                    value={cartao.cvv}
                    onChange={(e) =>
                      alterarCartao("cvv", somenteDigitos(e.target.value))
                    }
                  />
                </div>
              </div>

              <p className="pagamento-nota">
                Simulação: o número e o CVV não são enviados nem guardados. Só
                ficam salvos os 4 últimos dígitos e a bandeira.
              </p>
            </>
          )}

          {usandoStripe && (
            <Elements stripe={obterStripe()}>
              <CartaoStripe
                aoCriar={registrarMetodo}
                salvando={salvando}
                erro={erro}
                setErro={setErro}
              />
            </Elements>
          )}

          {tipo === "pix" && (
            <p className="pagamento-nota">
              ⚡ Você paga por Pix ao final do frete (simulado nesta versão).
            </p>
          )}

          {tipo === "cash" && (
            <p className="pagamento-nota">
              💵 Você combina e paga em dinheiro diretamente ao motorista.
            </p>
          )}

          {!usandoStripe && erro && <p className="pagamento-erro">{erro}</p>}

          {!usandoStripe && (
            <button
              type="button"
              className="mapa-btn"
              disabled={salvando}
              onClick={salvar}
            >
              {salvando ? "Salvando..." : "Salvar forma de pagamento"}
            </button>
          )}
        </div>
      )}

      {!adicionando && erro && <p className="pagamento-erro">{erro}</p>}
    </div>
  );
}

export default MetodosPagamento;
