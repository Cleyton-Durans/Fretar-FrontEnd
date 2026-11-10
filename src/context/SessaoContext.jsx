import { createContext, useCallback, useContext, useMemo, useState } from "react";

import {
  api,
  limparSessao,
  obterUsuarioSessao,
  salvarSessao,
  tokenAuth,
} from "../lib/api";

const SessaoContext = createContext(null);

export function SessaoProvider({ children }) {
  const [usuario, setUsuario] = useState(() =>
    tokenAuth() ? obterUsuarioSessao() : null
  );

  const entrar = useCallback(({ token, usuario: novoUsuario }) => {
    salvarSessao({ token, usuario: novoUsuario });
    setUsuario(novoUsuario);
  }, []);

  const sair = useCallback(async () => {
    try {
      if (tokenAuth()) {
        await api("/auth/logout", { metodo: "POST" });
      }
    } catch {
      // A sessao local deve ser encerrada mesmo se a API estiver indisponivel.
    } finally {
      limparSessao();
      setUsuario(null);
    }
  }, []);

  const valor = useMemo(
    () => ({
      usuario,
      logado: Boolean(usuario && tokenAuth()),
      papel: usuario?.tipo ?? null,
      entrar,
      sair,
    }),
    [usuario, entrar, sair]
  );

  return (
    <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>
  );
}

export function useSessao() {
  const contexto = useContext(SessaoContext);

  if (!contexto) {
    throw new Error("useSessao deve ser usado dentro de <SessaoProvider>.");
  }

  return contexto;
}
