import { Link } from "react-router-dom";

function Rodape() {
  const anoAtual = new Date().getFullYear();

  return (
    <footer className="rodape">
      <p>© {anoAtual} Fretar. Todos os direitos reservados.</p>
      <Link to="/privacidade">Privacidade</Link>
    </footer>
  );
}

export default Rodape;