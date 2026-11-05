import { Navigate, useLocation } from "react-router-dom";

import { useSessao } from "../context/SessaoContext";

function caminhoDoPapel(papel) {
  return papel === "driver" ? "/motorista" : "/cliente";
}

/**
 * Guarda de rota baseada na sessao.
 * - Sem sessao: redireciona para /login (guardando o destino original).
 * - Com `papel`: exige que o tipo do usuario corresponda ("user"/"driver").
 */
function RotaProtegida({ papel, children }) {
  const { logado, papel: papelAtual } = useSessao();
  const localizacao = useLocation();

  if (!logado) {
    return (
      <Navigate to="/login" replace state={{ de: localizacao.pathname }} />
    );
  }

  if (papel && papelAtual !== papel) {
    return <Navigate to={caminhoDoPapel(papelAtual)} replace />;
  }

  return children;
}

export default RotaProtegida;
