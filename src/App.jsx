
import { useEffect, useState } from 'react'

import Cabecalho from './components/Cabecalho'
import Rodape from './components/Rodape'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Documentos from './pages/Documentos'
import Home from './pages/Home'

import './App.css'

function App() {
  const [pagina, setPagina] = useState('inicio')
  const [secaoPendente, setSecaoPendente] = useState(null)

  const [tema, setTema] = useState(() => {
    return localStorage.getItem('tema-fretar') || 'claro'
  })

  function alternarTema() {
    setTema((temaAtual) => {
      const novoTema =
        temaAtual === 'escuro' ? 'claro' : 'escuro'

      localStorage.setItem('tema-fretar', novoTema)

      return novoTema
    })
  }

  function navegar(novaPagina, event) {
    if (event) {
      event.preventDefault()
    }

    setSecaoPendente(null)
    setPagina(novaPagina)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  function irParaSecao(id, event) {
    if (event) {
      event.preventDefault()
    }

    setSecaoPendente(id)
    setPagina('inicio')
  }

  useEffect(() => {
    if (pagina !== 'inicio' || !secaoPendente) {
      return
    }

    const elemento = document.getElementById(secaoPendente)

    if (elemento) {
      elemento.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }

    setSecaoPendente(null)
  }, [pagina, secaoPendente])

  function irParaCadastro(event) {
    navegar('cadastro', event)
  }

  function irParaLogin(event) {
    navegar('login', event)
  }

  function abrirDocumento(tipo, event) {
    navegar(tipo, event)
  }

  return (
    <div className={`app tema-${tema}`}>
      <Cabecalho
        tema={tema}
        aoAlternarTema={alternarTema}
        onLogin={irParaLogin}
        onCadastro={irParaCadastro}
        onSecao={irParaSecao}
      />

      {pagina === 'inicio' && (
        <Home
          onLogin={irParaLogin}
          onCadastro={irParaCadastro}
        />
      )}

      {pagina === 'login' && (
        <Login
          tema={tema}
          onCadastro={irParaCadastro}
        />
      )}

      {pagina === 'cadastro' && (
        <Cadastro
          tema={tema}
          onLogin={irParaLogin}
          onDocumento={abrirDocumento}
        />
      )}

      {(pagina === 'termos' || pagina === 'privacidade') && (
        <Documentos
          tipo={pagina}
          onVoltar={irParaCadastro}
        />
      )}

      <Rodape onDocumento={abrirDocumento} />
    </div>
  )
}

export default App
