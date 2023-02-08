describe('complete workflow test', () => {
  it('Test animation and demo code 1', {defaultCommandTimeout: 120000}, () => {
    cy.visit('/');
    cy.url().should('include', '/');
    cy.getDemoCode1(); // writes demo code to editor. There are also more demo code that can be used. For example getDemoCode3().
    cy.pushLoadButton();
    cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(1) > div > div > app-tool-bar-mic-view > div > div > mat-slider')
      .type("{end}");
    cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(1) > div > div > app-tool-bar-mic-view > section > button:nth-child(2) > span.mat-button-wrapper')
      .click();
    cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(4) > div > div > app-stack > div > div:nth-child(8) > div.stack-value.ng-tns-c71-0')
      .should('have.text', ' 15 ');
  });

  it('Test animation and demo code 2(uses custom microprograms) ', {defaultCommandTimeout: 120000}, () => {
    cy.visit('/');
    cy.url().should('include', '/');
    cy.getDemoMicroProgram();
    cy.getDemoCode2(); // writes demo code to editor. There are also more demo code that can be used. For example getDemoCode3().
    cy.pushLoadButton();
    cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(1) > div > div > app-tool-bar-mic-view > div > div > mat-slider')
      .type("{end}");
    cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(1) > div > div > app-tool-bar-mic-view > section > button:nth-child(2) > span.mat-button-wrapper')
      .click();
    cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(4) > div > div > app-stack > div > div:nth-child(8) > div.stack-value.ng-tns-c71-0')
      .should('have.text', ' 15 ');
  });

  it('Test animation and the demo code 3(uses jumps)', {defaultCommandTimeout: 120000}, () => {
    cy.visit('/');
    cy.url().should('include', '/');
    cy.getDemoCode3(); // writes demo code to editor. There are also more demo code that can be used. For example getDemoCode3().
    cy.pushLoadButton();
    cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(1) > div > div > app-tool-bar-mic-view > div > div > mat-slider')
      .type("{end}");
    cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(1) > div > div > app-tool-bar-mic-view > section > button:nth-child(2) > span.mat-button-wrapper')
      .click();
    cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(4) > div > div > app-stack > div > div:nth-child(8) > div.stack-value.ng-tns-c71-0')
      .should('have.text', ' 8 ');
  });

})