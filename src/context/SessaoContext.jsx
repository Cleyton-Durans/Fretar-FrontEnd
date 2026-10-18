import { createContext, useCallback, useContext, useMemo, useState } from "react";

import {
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

  const sair = useCallback(() => {
    limparSessao();
    setUsuario(null);
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
