
function Rodape({ onDocumento }) {
  const anoAtual = new Date().getFullYear()

  return (
    <footer className="rodape">
      <p>
        © {anoAtual} Fretar. Todos os direitos reservados.
      </p>

      <nav aria-label="Documentos legais">
        <a
          href="#termos"
          onClick={(event) => onDocumento('termos', event)}
        >
          Termos de Uso
        </a>

        <a
          href="#privacidade"
          onClick={(event) => onDocumento('privacidade', event)}
        >
          Política de Privacidade
        </a>
      </nav>
    </footer>
  )
}

export default Rodape
