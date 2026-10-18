const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export function tokenAuth() {
  return localStorage.getItem("fretar_token") || "";
}

export function sessaoAtiva() {
  return Boolean(tokenAuth());
}

export function salvarSessao({ token, usuario }) {
  localStorage.setItem("fretar_token", token);
  localStorage.setItem("fretar_usuario", JSON.stringify(usuario));
}

export function limparSessao() {
  localStorage.removeItem("fretar_token");
  localStorage.removeItem("fretar_usuario");
}

export function obterUsuarioSessao() {
  try {
    return JSON.parse(localStorage.getItem("fretar_usuario") || "null");
  } catch {
    return null;
  }
}

function extrairMensagemErro(dados) {
  if (dados.message) {
    return dados.message;
  }

  if (dados.errors) {
    return Object.values(dados.errors)
      .flat()
      .join(" ");
  }

  return "Erro inesperado. Tente novamente.";
}

export async function api(
  caminho,
  { metodo = "GET", corpo = null, comAuth = true } = {}
) {
  const cabecalhos = {};

  if (corpo) {
    cabecalhos["Content-Type"] = "application/json";
  }

  if (comAuth) {
    const token = tokenAuth();
    if (token) {
      cabecalhos["Authorization"] = `Bearer ${token}`;
    }
  }

  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: metodo,
    headers: cabecalhos,
    body: corpo ? JSON.stringify(corpo) : null,
  });

  let dados = {};
  try {
    dados = await resposta.json();
  } catch {
    // resposta sem corpo
  }

  if (!resposta.ok) {
    const erro = new Error(extrairMensagemErro(dados));
    erro.status = resposta.status;
    throw erro;
  }

  return dados;
}

export { API_URL };