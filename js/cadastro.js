const botaoCliente = document.querySelector('#botaoCliente');
const botaoFreteiro = document.querySelector('#botaoFreteiro');

const formularioCliente = document.querySelector('#formularioCliente');
const formularioFreteiro = document.querySelector('#formularioFreteiro');

const formCliente = document.querySelector('#formCliente');
const formFreteiro = document.querySelector('#formFreteiro');

const mensagemCliente = document.querySelector('#mensagemCliente');
const mensagemFreteiro = document.querySelector('#mensagemFreteiro');


// Formulário inicial
formularioCliente.style.display = 'block';
formularioFreteiro.style.display = 'none';


// Botão Cliente
botaoCliente.addEventListener('click', function () {
    formularioCliente.style.display = 'block';
    formularioFreteiro.style.display = 'none';

    mensagemCliente.style.display = 'none';
    mensagemFreteiro.style.display = 'none';

    botaoCliente.classList.add('ativo');
    botaoFreteiro.classList.remove('ativo');
});


// Botão Freteiro
botaoFreteiro.addEventListener('click', function () {
    formularioFreteiro.style.display = 'block';
    formularioCliente.style.display = 'none';

    mensagemCliente.style.display = 'none';
    mensagemFreteiro.style.display = 'none';

    botaoFreteiro.classList.add('ativo');
    botaoCliente.classList.remove('ativo');
});


// Busca de CEP: funciona para Cliente e Freteiro
document.querySelectorAll('.btn-cep').forEach(function (botao) {
    botao.addEventListener('click', async function () {
        const formulario = botao.closest('form');
        const campoCep = formulario.querySelector('[id^="cep"]');

        const cep = campoCep.value.replace(/\D/g, '');

        if (cep.length !== 8) {
            alert('Digite um CEP válido com 8 números.');
            campoCep.focus();
            return;
        }

        botao.textContent = 'Buscando...';
        botao.disabled = true;

        try {
            const resposta = await fetch(
                `https://viacep.com.br/ws/${cep}/json/`
            );

            const endereco = await resposta.json();

            if (endereco.erro) {
                alert('CEP não encontrado.');
                return;
            }

            const sufixo = campoCep.id.replace('cep', '');

            document.querySelector(`#endereco${sufixo}`).value =
                endereco.logradouro || '';

            document.querySelector(`#cidade${sufixo}`).value =
                endereco.localidade || '';

            document.querySelector(`#estado${sufixo}`).value =
                endereco.uf || '';

        } catch (erro) {
            alert('Não foi possível buscar o CEP. Verifique sua internet e tente novamente.');
            console.error(erro);
        } finally {
            botao.textContent = 'Buscar CEP';
            botao.disabled = false;
        }
    });
});


// Formulário do Cliente
formCliente.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const nome = document.querySelector('#nomeCliente').value;
    const email = document.querySelector('#emailCliente').value;
    const telefone = document.querySelector('#telefoneCliente').value;
    const senha = document.querySelector('#senhaCliente').value;
    const confirmarSenha = document.querySelector('#confirmarSenhaCliente').value;

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

    if (senha !== confirmarSenha) {
        mensagemCliente.textContent = 'As senhas não são iguais.';
        mensagemCliente.style.display = 'block';
        return;
    }

    mensagemCliente.textContent = 'Cadastro válido!';
    mensagemCliente.style.display = 'block';
});


// Formulário do Freteiro
formFreteiro.addEventListener('submit', function (evento) {
    evento.preventDefault();

    const nome = document.querySelector('#nomeFreteiro').value;
    const cpf = document.querySelector('#cpfFreteiro').value;
    const email = document.querySelector('#emailFreteiro').value;
    const telefone = document.querySelector('#telefoneFreteiro').value;
    const senha = document.querySelector('#senhaFreteiro').value;
    const confirmarSenha = document.querySelector('#confirmarSenhaFreteiro').value;
    const tipoVeiculo = document.querySelector('#tipoVeiculo').value;
    const placa = document.querySelector('#placa').value;
    const renavam = document.querySelector('#renavam').value;

    if (
        nome === '' ||
        cpf === '' ||
        email === '' ||
        telefone === '' ||
        senha === '' ||
        confirmarSenha === '' ||
        tipoVeiculo === '' ||
        placa === '' ||
        renavam === ''
    ) {
        mensagemFreteiro.textContent = 'Preencha todos os campos obrigatórios.';
        mensagemFreteiro.style.display = 'block';
        return;
    }

    if (senha !== confirmarSenha) {
        mensagemFreteiro.textContent = 'As senhas não são iguais.';
        mensagemFreteiro.style.display = 'block';
        return;
    }

    mensagemFreteiro.textContent = 'Cadastro válido!';
    mensagemFreteiro.style.display = 'block';
});