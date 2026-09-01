function Rodape() {
  const anoAtual = new Date().getFullYear()

  return (
    <footer className="rodape">
      <p>
        © {anoAtual} Fretar. Todos os direitos reservados.
      </p>

      <a href="#privacidade">
        Privacidade
      </a>
    </footer>
  )
}

export default Rodape