const botaoCliente = document.querySelector('#botaoCliente');
const botaoFreteiro = document.querySelector('#botaoFreteiro');

const formularioCliente = document.querySelector('#formularioCliente');
const formularioFreteiro = document.querySelector('#formularioFreteiro');

const formCliente = document.querySelector('#formCliente');
const formFreteiro = document.querySelector('#formFreteiro');

const mensagemCliente = document.querySelector('#mensagemCliente');
const mensagemFreteiro = document.querySelector('#mensagemFreteiro');


// Esconde os formulários quando a página começa
formularioCliente.style.display = 'none';
formularioFreteiro.style.display = 'none';


// ===============================
// BOTÃO CLIENTE
// ===============================

botaoCliente.addEventListener('click', function () {

    formularioCliente.style.display = 'block';
    formularioFreteiro.style.display = 'none';

    // Limpa mensagens anteriores
    mensagemCliente.style.display = 'none';
    mensagemFreteiro.style.display = 'none';

});


// ===============================
// BOTÃO FRETEIRO
// ===============================

botaoFreteiro.addEventListener('click', function () {

    formularioFreteiro.style.display = 'block';
    formularioCliente.style.display = 'none';

    // Limpa mensagens anteriores
    mensagemCliente.style.display = 'none';
    mensagemFreteiro.style.display = 'none';

});


// ===============================
// FORMULÁRIO DO CLIENTE
// ===============================

formCliente.addEventListener('submit', function (evento) {

    evento.preventDefault();

    const nome = document.querySelector('#nomeCliente').value;
    const email = document.querySelector('#emailCliente').value;
    const telefone = document.querySelector('#telefoneCliente').value;
    const senha = document.querySelector('#senhaCliente').value;
    const confirmarSenha = document.querySelector('#confirmarSenhaCliente').value;


    // Verifica campos vazios

    if (
        nome === '' ||
        email === '' ||
        telefone === '' ||
        senha === '' ||
        confirmarSenha === ''
    ) {

        mensagemCliente.textContent = 'Preencha todos os campos.';
        mensagemCliente.style.display = 'block';

        return;
    }


    // Verifica se as senhas são iguais

    if (senha !== confirmarSenha) {

        mensagemCliente.textContent = 'As senhas não são iguais.';
        mensagemCliente.style.display = 'block';

        return;
    }


    // Cadastro válido

    mensagemCliente.textContent = 'Cadastro válido!';
    mensagemCliente.style.display = 'block';

});


// ===============================
// FORMULÁRIO DO FRETEIRO
// ===============================

formFreteiro.addEventListener('submit', function (evento) {

    evento.preventDefault();

    const nome = document.querySelector('#nomeFreteiro').value;
    const email = document.querySelector('#emailFreteiro').value;
    const telefone = document.querySelector('#telefoneFreteiro').value;
    const senha = document.querySelector('#senhaFreteiro').value;
    const confirmarSenha = document.querySelector('#confirmarSenhaFreteiro').value;
    const tipoVeiculo = document.querySelector('#tipoVeiculo').value;
    const placa = document.querySelector('#placa').value;


    // Verifica campos vazios

    if (
        nome === '' ||
        email === '' ||
        telefone === '' ||
        senha === '' ||
        confirmarSenha === '' ||
        tipoVeiculo === '' ||
        placa === ''
    ) {

        mensagemFreteiro.textContent = 'Preencha todos os campos.';
        mensagemFreteiro.style.display = 'block';

        return;
    }


    // Verifica se as senhas são iguais

    if (senha !== confirmarSenha) {

        mensagemFreteiro.textContent = 'As senhas não são iguais.';
        mensagemFreteiro.style.display = 'block';

        return;
    }


    // Cadastro válido

    mensagemFreteiro.textContent = 'Cadastro válido!';
    mensagemFreteiro.style.display = 'block';

});