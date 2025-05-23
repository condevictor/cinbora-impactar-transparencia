describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000')
    cy.get('.flex > .shadow').click()
    cy.get('#mobile').click()
    cy.get('#loginMobile').click()
    cy.get('body').click(200, 200, { force: true });

    cy.get('#email').click()
    cy.get('#email').type('apiteste@rdmapps.com.br')
    cy.get('#password').type('123456')
    cy.get('#entrar').click()
    cy.get('#editar').click()
    cy.get('#titulo').clear()
    cy.get('#titulo').type('cypress automatizado')
    cy.get('#tipo').clear()
    cy.get('#tipo').type('testezin')
    cy.get('#meta').clear()
    cy.get('#meta').type('6666')
    cy.get('#arrecadado').clear()
    cy.get('#arrecadado').type('4444')
    cy.get('select').select('aa');
    cy.get('#gasto').clear()
    cy.get('#gasto').type('3333')
    cy.get('#imagemSelecionar').click()
    cy.get('#salvarBotao').click()
    cy.get('#tab').click()
    cy.contains('button[id="tab"]','Balanço de Gastos').click()
    cy.contains('button[id="tab"]','Galeria').click()
    cy.contains('button[id="tab"]','Documentos').click()
    cy.get('#acao').click()
    cy.contains('#tabAcao', 'Documentos').click()
    cy.get('#editarAcao').click()
    cy.get('#tituloAcao').clear()
    cy.get('#tituloAcao').type('cypress acao')
    cy.get('#tipoAcao').clear()
    cy.get('#tipoAcao').type('testezin')
    cy.get('#metaAcao').clear()
    cy.get('#metaAcao').type('10100')
    cy.get('#arrecadadoAcao').clear()
    cy.get('#arrecadadoAcao').type('7777')
    cy.get('#selectAcao').select('propina')
    cy.get('#gastoAcao').clear()
    cy.get('#gastoAcao').type('1000')
    cy.get('#imagemAcao').click()
    cy.get('#salvarAcao').click()
    cy.wait(5000);
    cy.get('button.rounded-full.bg-gray-200')
      .should('be.visible')
      .click({ force: true });
    cy.get('#historico').click()
    cy.get('button.rounded-full.bg-gray-200')
    .should('be.visible')
    .click({ force: true });
    cy.get('#informacaoOngs').click()
    cy.get('#descricao').clear()
    cy.get('#descricao').type('automatizei papai')
    cy.get('#salvarOngs').click()
  })
}) 