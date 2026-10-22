const formLogin = document.querySelector('#formLogin');
const emailLogin = document.querySelector('#emailLogin');
const senhaLogin = document.querySelector('#senhaLogin');
const mensagemLogin = document.querySelector('#mensagemLogin');
const mostrarSenha = document.querySelector('#mostrarSenha');

mostrarSenha.addEventListener('click', function () {
    if (senhaLogin.type === 'password') {
        senhaLogin.type = 'text';
        mostrarSenha.textContent = '🙈';
    } else {
        senhaLogin.type = 'password';
        mostrarSenha.textContent = '👁';
    }
});

formLogin.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const email = emailLogin.value.trim();
    const senha = senhaLogin.value.trim();

    mensagemLogin.style.display = 'none';

    if (email === '' || senha === '') {
        mensagemLogin.textContent = 'Preencha seu e-mail e sua senha.';
        mensagemLogin.className = 'mensagem-login erro-login';
        mensagemLogin.style.display = 'block';
        return;
    }

    if (senha.length < 6) {
        mensagemLogin.textContent = 'A senha deve ter pelo menos 6 caracteres.';
        mensagemLogin.className = 'mensagem-login erro-login';
        mensagemLogin.style.display = 'block';
        return;
    }

    mensagemLogin.textContent = 'Login validado com sucesso!';
    mensagemLogin.className = 'mensagem-login sucesso-login';
    mensagemLogin.style.display = 'block';
});