import { useState } from 'react'

import Cabecalho from './components/Cabecalho'
import Rodape from './components/Rodape'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'

import './App.css'

function App() {
  const [pagina, setPagina] = useState('login')

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

  function irParaCadastro(event) {
    if (event) {
      event.preventDefault()
    }

    setPagina('cadastro')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  function irParaLogin(event) {
    if (event) {
      event.preventDefault()
    }

    setPagina('login')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div className={`app tema-${tema}`}>

      <Cabecalho
        tema={tema}
        aoAlternarTema={alternarTema}
        onLogin={irParaLogin}
        onCadastro={irParaCadastro}
      />

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
        />
      )}

      <Rodape />

    </div>
  )
}

export default App