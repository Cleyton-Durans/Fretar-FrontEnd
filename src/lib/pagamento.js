// Utilitarios de formas de pagamento (cartao, Pix, dinheiro).
// IMPORTANTE: o numero completo do cartao e o CVV nunca sao enviados ao servidor.
// So vao os 4 ultimos digitos e a bandeira (o pagamento real e simulado).

export const TIPOS_PAGAMENTO = {
  card: { icone: "💳", rotulo: "Cartão" },
  pix: { icone: "⚡", rotulo: "Pix" },
  cash: { icone: "💵", rotulo: "Dinheiro" },
};

const NOMES_BANDEIRA = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  elo: "Elo",
  discover: "Discover",
  diners: "Diners",
  jcb: "JCB",
  unionpay: "UnionPay",
};

export function somenteDigitos(valor) {
  return String(valor || "").replace(/\D/g, "");
}

export function bandeiraDoCartao(numero) {
  const n = somenteDigitos(numero);
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(n)) return "elo";
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  return "cartao";
}

// Algoritmo de Luhn (validacao basica do numero do cartao).
export function numeroCartaoValido(valor) {
  const n = somenteDigitos(valor);
  if (n.length < 13 || n.length > 19) return false;

  let soma = 0;
  let dobrar = false;
  for (let i = n.length - 1; i >= 0; i -= 1) {
    let digito = Number(n[i]);
    if (dobrar) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    soma += digito;
    dobrar = !dobrar;
  }
  return soma % 10 === 0;
}

export function validadeValida(valor) {
  const m = String(valor || "").match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;

  const mes = Number(m[1]);
  const ano = 2000 + Number(m[2]);
  if (mes < 1 || mes > 12) return false;

  // vale ate o ultimo dia do mes de validade
  return new Date(ano, mes, 1) > new Date();
}

export function formatarNumeroCartao(valor) {
  return somenteDigitos(valor)
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function formatarValidade(valor) {
  const d = somenteDigitos(valor).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export function rotuloMetodo(metodo) {
  if (!metodo) return "";
  if (metodo.type === "pix") return "Pix";
  if (metodo.type === "cash") return "Dinheiro";

  const bandeira = NOMES_BANDEIRA[metodo.card_brand] || "Cartão";
  return `${bandeira} •••• ${metodo.last_4_digits || "----"}`;
}

export function iconeMetodo(metodo) {
  return (TIPOS_PAGAMENTO[metodo?.type] || TIPOS_PAGAMENTO.card).icone;
}

export function novoIdMetodo(tipo) {
  const aleatorio = Math.random().toString(36).slice(2, 8);
  return `pm_mock_${tipo}_${Date.now()}_${aleatorio}`;
}
