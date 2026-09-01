import { useState } from 'react'

function Login({ onCadastro }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState('')

  function handleLogin(event) {
    event.preventDefault()

    if (email === 'teste@fretar.com' && senha === '123456') {
      localStorage.setItem('token', 'meu-token-falso')
      setMensagem('✓ Login realizado com sucesso!')
    } else {
      setMensagem('E-mail ou senha inválidos.')
    }
  }

  return (
    <main className="cadastro-layout">

      <section className="cadastro-card">

        <div className="cadastro-titulo">
          <h2>Entrar</h2>

          <p>
            Faça login para acessar sua conta
          </p>
        </div>

        {mensagem && (
          <div
            className={
              mensagem.includes('sucesso')
                ? 'mensagem-cadastro sucesso'
                : 'mensagem-cadastro erro'
            }
          >
            {mensagem}
          </div>
        )}

        <form
          className="cadastro-formulario"
          onSubmit={handleLogin}
        >

          <div className="linha-cadastro">

            <div className="campo-cadastro campo-grande">

              <label htmlFor="email">
                E-mail
              </label>

              <input
                type="email"
                id="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />

            </div>

          </div>

          <div className="linha-cadastro">

            <div className="campo-cadastro campo-grande">

              <label htmlFor="senha">
                Senha
              </label>

              <input
                type="password"
                id="senha"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(event) =>
                  setSenha(event.target.value)
                }
                required
              />

            </div>

          </div>

          <button
            type="submit"
            className="btn-cadastrar"
          >
            Entrar
          </button>

        </form>

        <div className="login-link">

          <span>
            Não tem conta?{' '}
          </span>

          <button
            type="button"
            onClick={onCadastro}
          >
            Criar conta
          </button>

        </div>

      </section>

    </main>
  )
}

export default Login