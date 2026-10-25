
function Documentos({ tipo, onVoltar }) {
  const termos = tipo === 'termos'

  return (
    <main className="documentos-layout">
      <article className="documentos-card">
        <button
          type="button"
          className="documentos-voltar"
          onClick={onVoltar}
        >
          ← Voltar
        </button>

        <p className="documentos-identificacao">
          FRETAR · DOCUMENTAÇÃO
        </p>

        <h1>
          {termos ? 'Termos de Uso' : 'Política de Privacidade'}
        </h1>

        <p className="documentos-atualizacao">
          Minuta para revisão antes da publicação.
        </p>

        {termos ? (
          <>
            <h2>1. Sobre a plataforma</h2>
            <p>
              O Fretar é uma plataforma proposta para aproximar
              pessoas que precisam transportar mercadorias e
              profissionais que oferecem serviços de frete.
              As funcionalidades disponíveis dependem da
              implementação efetiva do sistema.
            </p>

            <h2>2. Cadastro e informações</h2>
            <p>
              O usuário deve fornecer informações verdadeiras,
              completas e atualizadas. Cada usuário é responsável
              pela segurança de suas credenciais e pelas
              atividades realizadas em sua conta.
            </p>

            <h2>3. Responsabilidades dos usuários</h2>
            <p>
              Clientes devem informar corretamente os dados
              necessários para solicitar um transporte. Freteiros
              devem manter seus dados cadastrais e informações
              do veículo atualizados, além de observar as normas
              aplicáveis à atividade de transporte.
            </p>

            <h2>4. Uso adequado</h2>
            <p>
              Não é permitido utilizar a plataforma para
              atividades ilícitas, fornecer informações falsas,
              tentar acessar contas de terceiros ou comprometer
              a segurança do sistema.
            </p>

            <h2>5. Serviços e pagamentos</h2>
            <p>
              As condições de contratação, preços, pagamentos,
              cancelamentos e responsabilidades pelo transporte
              deverão ser informadas de forma clara quando essas
              funcionalidades estiverem disponíveis.
            </p>

            <h2>6. Suspensão e encerramento</h2>
            <p>
              O acesso poderá ser restringido diante de indícios
              de fraude, uso ilícito ou violação destes termos,
              respeitadas as normas aplicáveis e os direitos do
              usuário.
            </p>

            <h2>7. Alterações</h2>
            <p>
              Estes termos poderão ser atualizados. Alterações
              relevantes deverão ser comunicadas de maneira
              adequada aos usuários.
            </p>

            <h2>8. Contato</h2>
            <p>
              Responsável pela plataforma: [PREENCHER NOME OU
              RAZÃO SOCIAL]. Contato: [PREENCHER E-MAIL OFICIAL].
            </p>
          </>
        ) : (
          <>
            <h2>1. Quem é responsável pelos dados?</h2>
            <p>
              O controlador dos dados pessoais deverá ser
              identificado aqui: [PREENCHER NOME OU RAZÃO SOCIAL,
              CPF/CNPJ aplicável e contato oficial].
            </p>

            <h2>2. Quais dados podem ser tratados?</h2>
            <p>
              Conforme as funcionalidades efetivamente
              implementadas, poderão ser solicitados nome,
              telefone, e-mail, CPF, endereço, CEP, cidade,
              estado e dados necessários à criação da conta.
              Para freteiros, poderão ser solicitados também
              dados do veículo, como tipo, placa e RENAVAM.
            </p>

            <h2>3. Para que os dados são utilizados?</h2>
            <p>
              As finalidades previstas incluem criar e administrar
              contas, permitir o uso dos serviços, viabilizar o
              contato entre clientes e freteiros, proteger a
              plataforma e cumprir obrigações legais. Cada
              finalidade deverá ter uma base legal adequada.
            </p>

            <h2>4. Compartilhamento</h2>
            <p>
              Os dados poderão ser compartilhados quando
              necessário para prestar os serviços, cumprir
              obrigações legais ou atender a outras hipóteses
              permitidas pela legislação. Os destinatários e as
              informações efetivamente compartilhadas deverão
              ser especificados antes da publicação desta política.
            </p>

            <h2>5. Cookies e serviços externos</h2>
            <p>
              O projeto utiliza consulta de CEP por meio do
              serviço ViaCEP. A política definitiva deverá
              descrever os serviços externos, cookies, registros
              técnicos e demais tecnologias realmente utilizados.
            </p>

            <h2>6. Segurança e conservação</h2>
            <p>
              Devem ser adotadas medidas técnicas e
              administrativas adequadas para proteger os dados.
              A conservação ocorrerá pelo período necessário às
              finalidades aplicáveis e às obrigações legais,
              observadas as hipóteses de eliminação previstas
              na legislação.
            </p>

            <h2>7. Direitos do titular</h2>
            <p>
              Nos termos da LGPD, o titular pode solicitar,
              conforme aplicável, confirmação do tratamento,
              acesso, correção, informações sobre compartilhamento,
              oposição, portabilidade e eliminação nas hipóteses
              previstas em lei, entre outros direitos.
            </p>

            <h2>8. Como exercer seus direitos?</h2>
            <p>
              Canal para solicitações de privacidade:
              [PREENCHER E-MAIL OU CANAL OFICIAL]. O procedimento
              de atendimento deverá ser definido pelo responsável
              pelo tratamento.
            </p>

            <h2>9. Atualizações desta política</h2>
            <p>
              Esta política poderá ser atualizada para refletir
              mudanças nos serviços, nas práticas de tratamento
              ou nas exigências legais. A versão publicada deverá
              indicar a data de sua última atualização.
            </p>
          </>
        )}

        <button
          type="button"
          className="btn-cadastrar documentos-botao-voltar"
          onClick={onVoltar}
        >
          Voltar ao Fretar
        </button>
      </article>
    </main>
  )
}

export default Documentos
