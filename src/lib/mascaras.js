// Máscaras de digitação e validações usadas nos formulários.

export const apenasDigitos = (valor) => String(valor ?? "").replace(/\D/g, "");

export function mascararTelefone(valor) {
  const d = apenasDigitos(valor).slice(0, 11);

  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function mascararCpf(valor) {
  const d = apenasDigitos(valor).slice(0, 11);

  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function mascararCnpj(valor) {
  const d = apenasDigitos(valor).slice(0, 14);

  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

// Até 11 dígitos vira CPF; acima disso vira CNPJ.
export function mascararCpfCnpj(valor) {
  const d = apenasDigitos(valor).slice(0, 14);
  return d.length <= 11 ? mascararCpf(d) : mascararCnpj(d);
}

export function mascararCep(valor) {
  const d = apenasDigitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

// ABC-1234 (antiga) ou ABC1D23 (Mercosul).
export function mascararPlaca(valor) {
  const t = String(valor ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 7);

  if (t.length > 3 && /^\d$/.test(t[3]) && (t.length < 5 || /^\d$/.test(t[4]))) {
    return `${t.slice(0, 3)}-${t.slice(3)}`;
  }
  return t;
}

export const mascararCnh = (valor) => apenasDigitos(valor).slice(0, 11);

export const mascararNumero = (valor) =>
  String(valor ?? "").replace(/[^\dA-Za-z/\- ]/g, "").slice(0, 10);

/* ---------------------------- validações ---------------------------- */

export function validarCpf(valor) {
  const d = apenasDigitos(valor);

  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

  const digito = (base, pesoInicial) => {
    const soma = base
      .split("")
      .reduce((acc, n, i) => acc + Number(n) * (pesoInicial - i), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return (
    digito(d.slice(0, 9), 10) === Number(d[9]) &&
    digito(d.slice(0, 10), 11) === Number(d[10])
  );
}

export function validarCnpj(valor) {
  const d = apenasDigitos(valor);

  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;

  const digito = (base) => {
    const pesos = base.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = base
      .split("")
      .reduce((acc, n, i) => acc + Number(n) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  return (
    digito(d.slice(0, 12)) === Number(d[12]) &&
    digito(d.slice(0, 13)) === Number(d[13])
  );
}

export function validarCpfCnpj(valor) {
  const d = apenasDigitos(valor);
  if (d.length === 11) return validarCpf(d);
  if (d.length === 14) return validarCnpj(d);
  return false;
}

export const validarEmail = (valor) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(valor ?? "").trim());

export const validarTelefone = (valor) => {
  const d = apenasDigitos(valor);
  return d.length === 10 || d.length === 11;
};

export const validarPlaca = (valor) =>
  /^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/.test(String(valor ?? "").toUpperCase());

export const validarCep = (valor) => apenasDigitos(valor).length === 8;

// 0 a 4: fraca ... excelente.
export function forcaDaSenha(senha) {
  if (!senha) return { nivel: 0, rotulo: "" };

  let pontos = 0;
  if (senha.length >= 8) pontos += 1;
  if (senha.length >= 12) pontos += 1;
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos += 1;
  if (/\d/.test(senha) && /[^A-Za-z0-9]/.test(senha)) pontos += 1;

  const nivel = senha.length < 8 ? 1 : Math.max(1, pontos);
  const rotulos = ["", "Fraca", "Razoável", "Boa", "Forte"];

  return { nivel, rotulo: rotulos[nivel] };
}
