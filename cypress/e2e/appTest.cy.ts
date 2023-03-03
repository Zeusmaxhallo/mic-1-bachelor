describe('complete workflow test without animation', () => {
  beforeEach(() => {
    cy.visit('/')
  });

  it('Test the navigation to the default page', () => {
    cy.url().should('include', '/')
  });

  it('Tests whether the About Dialog is opening', ()=> {
    cy.get('body > app-root > app-tool-bar > mat-toolbar > button:nth-child(8)')
      .click();
    cy.get('#mat-dialog-0 > app-about-dialog > h1').should('include.text', 'About');
  });

  it('Tests whether the "Getting Started" Dialog is opening', ()=> {
    cy.get('body > app-root > app-tool-bar > mat-toolbar > button:nth-child(7)')
      .click();
    cy.get('#mat-dialog-0 > app-getting-started-dialog > h1').should('include.text', 'Getting Started');
  });

  it('Load demo code from "Getting Started" Dialog', ()=> {
    cy.get('body > app-root > app-tool-bar > mat-toolbar > button:nth-child(7)')
      .click();
    cy.get('#mat-dialog-0 > app-getting-started-dialog > mat-dialog-content > mat-dialog-actions > button:nth-child(1)')
      .click();
    cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(3) > div > div > app-editor > div')
      .should('contain.text', '.method add(p1, p2)');
  });

  it('tests whether the macro- and micro-code is persistant when the site is reloaded', () => {
    cy.emptyEditors();
    cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(2) > div > div > app-micro-editor > div')
      .type('testMicro7457034950', {delay: 1})
      .should('include.text', 'testMicro7457034950');
    cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(3) > div > div > app-editor > div')
      .type('testMacro9349856039', {delay: 1})
      .should('include.text', 'testMacro9349856039');
    cy.visit('/');
    cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(2) > div > div > app-micro-editor > div')
      .should('include.text', 'testMicro7457034950');
    cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(3) > div > div > app-editor > div')
      .should('include.text', 'testMacro9349856039');
  });

  it('Test demo code 1, the result has to be 15', {defaultCommandTimeout: 120000}, () => {
    cy.emptyEditors();
    cy.getStandardMicroPrograms();
    cy.getDemoCode1(); // writes demo code to editor. There are also more demo code that can be used. For example getDemoCode3().
    cy.pushResetButton();
    cy.get('#mat-checkbox-1-input').uncheck({force: true});
    cy.pushPlayButton();
    cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(4) > div > div > app-stack > div > div:nth-child(8) > div.stack-value.ng-tns-c71-0')
      .should('have.text', ' 15 ');
  });

  it('Test demo code 2(uses custom microprograms), the result has to be 15 ', {defaultCommandTimeout: 10000}, () => {
    cy.emptyEditors();
    cy.getDemoMicroPrograms();
    cy.getDemoCode2(); // writes demo code to editor. There are also more demo code that can be used. For example getDemoCode3().
    cy.pushResetButton();
    cy.get('#mat-checkbox-1-input').uncheck({force: true});
    cy.pushPlayButton();
    cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(4) > div > div > app-stack > div > div:nth-child(8) > div.stack-value.ng-tns-c71-0')
      .should('have.text', ' 15 ');
  });

  it('Test demo code 3(uses jumps), the 8 and 9 in the stack need to switch position for the result to be right', {defaultCommandTimeout: 10000}, () => {
    cy.emptyEditors();
    cy.getStandardMicroPrograms();
    cy.getDemoCode3(); // writes demo code to editor. There are also more demo code that can be used. For example getDemoCode3().
    cy.pushResetButton();
    cy.get('#mat-checkbox-1-input').uncheck({force: true});
    cy.pushPlayButton();
    cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(4) > div > div > app-stack > div > div:nth-child(8) > div.stack-value.ng-tns-c71-0')
      .should('have.text', ' 9 ');
    cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(4) > div > div > app-stack > div > div:nth-child(9) > div.stack-value.ng-tns-c71-0')
      .should('have.text', ' 8 ');
  });

})