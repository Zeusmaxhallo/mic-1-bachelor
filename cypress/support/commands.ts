// ***********************************************
// This example namespace declaration will help
// with Intellisense and code completion in your
// IDE or Text Editor.

// ***********************************************
const code1: string = `.main
BIPUSH 7
BIPUSH 8
INVOKEVIRTUAL add
.end-main

.method add(p1, p2)
ILOAD p1
ILOAD p2
IADD
.end-method`;

const code2: string = `.main
CPUSH 7
CPUSH 8
CINVOKE met
.end-main

.method met(p1, p2)
ILOAD p1
ILOAD p2
IADD
.end-method`;

const code3: string = `.main
BIPUSH 0
IFEQ skip
test: BIPUSH 8
BIPUSH 9
INVOKEVIRTUAL switch
skip: GOTO test
.end-main

.method switch(p1, p2)
ILOAD p2
ILOAD p1
.end-method`;

const microCode: string = `Main1: PC=PC+1; fetch; goto(MBR)

(0x00)NOP:; goto Main1

(0x10)BIPUSH: SP=MAR=SP+1;
PC=PC+1; fetch
MDR=TOS=MBR; wr; goto Main1;

(0x13)ISUB: MAR=SP=SP-1; rd
H=TOS
MDR=TOS=MDR-H; wr; goto Main1

(0x16)IAND: MAR=SP=SP-1; rd
H=TOS
MDR=TOS=MDR AND H; wr; goto Main1

(0x02)IOR:MAR=SP=SP-1; rd
H=TOS
MDR=TOS=MDR OR H; wr; goto Main1

(0x05)DUP: MAR = SP = SP+1
MDR=TOS;wr;goto Main1
(0x57)POP: MAR=SP=SP-1; rd;
TOS=MDR;goto Main1

(0x19)SWAP: MAR=SP-1; rd;
MAR=SP
H=MDR;wr
MDR=TOS
MAR=SP-1; wr
TOS=H; goto Main1

(0x0D)IADD: MAR=SP=SP-1; rd
H=TOS
MDR=TOS=MDR+H; wr; goto Main1

(0x1F)ILOAD:H=LV;
MAR=MBRU+H;rd;
iload3: MAR=SP=SP+1;
PC=PC+1; fetch; wr;
TOS=MDR; goto Main1

(0x24)ISTORE: H=LV
MAR=MBRU+H
istore3: MDR=TOS;wr;
SP=MAR=SP-1;rd
PC=PC+1;fetch
TOS=MDR; goto Main1

(0x2A)WIDE: PC=PC+1; fetch; goto(MBR or 0x100)

(0x2B)LDC_W: PC=PC+1; fetch;
H=MBRU <<8
H=MBRU OR H
MAR=H+CPP; rd; goto iload3

(0x2F)IINC: H=LV
MAR=MBRU+H; rd
PC=PC+1; fetch
H=MDR
PC=PC+1; fetch
MDR=MBR+H; wr; goto Main1

(0xA7)GOTO:OPC=PC-1
goto2: PC=PC+1; fetch;
H=MBR <<8
H=MBRU OR H
PC=OPC+H; fetch
goto Main1

(0x09)IFLT: MAR=SP=SP-1; rd;
OPC=TOS
TOS=MDR
N=OPC; if(N) goto T; else goto F

(0x35)IFEQ:MAR=SP=SP-1; rd;
OPC=TOS
TOS=MDR
Z=OPC; if(Z) goto T; else goto F

(0x39)IF_ICMPEQ: MAR=SP=SP-1; rd
MAR=SP=SP-1
H=MDR;rd
OPC=TOS
TOS=MDR
Z=OPC-H; if(Z) goto T; else goto F
F:PC=PC+1
PC=PC+1; fetch;
goto Main1

(0x13F)T:OPC=PC-1;fetch; goto goto2

(0xB6)INVOKEVIRTUAL:PC=PC+1; fetch
H=MBRU <<8
H = MBRU OR H
MAR=CPP + H; rd
OPC = PC+1
PC=MDR; fetch
PC=PC+1; fetch
H = MBRU <<8
H = MBRU OR H
PC=PC+1; fetch
TOS=SP-H
TOS=MAR=TOS+1
PC=PC+1; fetch
H = MBRU <<8
H = MBRU OR H
MDR = SP + H +1; wr
MAR=SP=MDR
MDR = OPC; wr
MAR = SP = SP+1
MDR = LV; wr
PC=PC+1; fetch
LV=TOS; goto Main1

(0xAF)IRETURN:MAR=SP=LV; rd
LV=MAR=MDR; rd
MAR=LV+1
PC=MDR;rd;fetch
MAR=SP
LV=MDR
MDR=TOS; wr; goto Main1`

const customMicroCode: string = `Main1: PC=PC+1; fetch; goto(MBR)

(0x00)NOP:; goto Main1

(0xC6)BIPUSH: SP=MAR=SP+1;
PC=PC+1; fetch
MDR=TOS=MBR; wr; goto Main1;

(0x10)CPUSH: SP=MAR=SP+1;
PC=PC+1; fetch
MDR=TOS=MBR; wr; goto Main1;

(0x64)ISUB: MAR=SP=SP-1; rd
H=TOS
MDR=TOS=MDR-H; wr; goto Main1

(0x7E)IAND: MAR=SP=SP-1; rd
H=TOS
MDR=TOS=MDR AND H; wr; goto Main1

(0x80)IOR:MAR=SP=SP-1; rd
H=TOS
MDR=TOS=MDR OR H; wr; goto Main1

(0x59)DUP: MAR = SP = SP+1
MDR=TOS;wr;goto Main1

(0x57)POP: MAR=SP=SP-1; rd;
TOS=MDR;goto Main1

(0x5E)SWAP: MAR=SP-1; rd;
MAR=SP
H=MDR;wr
MDR=TOS
MAR=SP-1; wr
TOS=H; goto Main1

(0x02)IADD: MAR=SP=SP-1; rd
H=TOS
MDR=TOS=MDR+H; wr; goto Main1

(0x15)ILOAD:H=LV;
MAR=MBRU+H;rd;
iload3: MAR=SP=SP+1;
PC=PC+1; fetch; wr;
TOS=MDR; goto Main1

(0x36)ISTORE: H=LV
MAR=MBRU+H
istore3: MDR=TOS;wr;
SP=MAR=SP-1;rd
PC=PC+1;fetch
TOS=MDR; goto Main1

(0xB5)WIDE: PC=PC+1; fetch; goto(MBR or 0x100)

(0x32)LDC_W: PC=PC+1; fetch;
H=MBRU <<8
H=MBRU OR H
MAR=H+CPP; rd; goto iload3

(0x84)IINC: H=LV
MAR=MBRU+H; rd
PC=PC+1; fetch
H=MDR
PC=PC+1; fetch
MDR=MBR+H; wr; goto Main1

(0xA7)GOTO:OPC=PC-1
goto2: PC=PC+1; fetch;
H=MBR <<8
H=MBRU OR H
PC=OPC+H; fetch
goto Main1

(0x9B)IFLT: MAR=SP=SP-1; rd;
OPC=TOS
TOS=MDR
N=OPC; if(N) goto T; else goto F

(0x99)IFEQ:MAR=SP=SP-1; rd;
OPC=TOS
TOS=MDR
Z=OPC; if(Z) goto T; else goto F

(0x9F)IF_ICMPEQ: MAR=SP=SP-1; rd
MAR=SP=SP-1
H=MDR;rd
OPC=TOS
TOS=MDR
Z=OPC-H; if(Z) goto T; else goto F
T:OPC=PC-1;fetch; goto goto2
F:PC=PC+1
PC=PC+1; fetch;
goto Main1

(0xB6)CINVOKE:PC=PC+1; fetch
H=MBRU <<8
H = MBRU OR H
MAR=CPP + H; rd
OPC = PC+1
PC=MDR; fetch
PC=PC+1; fetch
H = MBRU <<8
H = MBRU OR H
PC=PC+1; fetch
TOS=SP-H
TOS=MAR=TOS+1
PC=PC+1; fetch
H = MBRU <<8
H = MBRU OR H
MDR = SP + H +1; wr
MAR=SP=MDR
MDR = OPC; wr
MAR = SP = SP+1
MDR = LV; wr
PC=PC+1; fetch
LV=TOS; goto Main1

(0xAF)IRETURN:MAR=SP=LV; rd
LV=MAR=MDR; rd
MAR=LV+1
PC=MDR;rd;fetch
MAR=SP
LV=MDR
MDR=TOS; wr; goto Main1`;


declare namespace Cypress {
  interface Chainable<Subject = any> {
    pushResetButton(): typeof pushResetButton;
    pushPlayButton(): typeof pushPlayButton;
    getDemoCode1(): typeof getDemoCode1;
    getDemoCode2(): typeof getDemoCode2;
    getDemoCode3(): typeof getDemoCode3;
    getDemoMicroPrograms(): typeof getDemoMicroPrograms;
    getStandardMicroPrograms(): typeof getStandardMicroPrograms;
    emptyEditors(): typeof emptyEditors;
  }
}


function pushResetButton(): void{
  cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(1) > div > div > app-tool-bar-mic-view > section > button:nth-child(4)')
    .click();
}

function pushPlayButton(): void{
  cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(1) > div > div > app-tool-bar-mic-view > section > button:nth-child(2) > span.mat-button-wrapper')
    .click();
}

function getDemoCode1(): void {
  cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(3) > div > div > app-editor > div')
    .type(code1, {delay: 1});
}

function getDemoCode2(): void {
  cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(3) > div > div > app-editor > div')
    .type(code2, {delay: 1});
}

function getDemoCode3(): void {
  cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(3) > div > div > app-editor > div')
    .type(code3, {delay: 1});
}

function getDemoMicroPrograms(): void {
  cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(2) > div > div > app-micro-editor > div')
    .type(customMicroCode, {delay: 1});
}

function getStandardMicroPrograms(): void {
  cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(2) > div > div > app-micro-editor > div')
    .type(microCode, {delay: 1});
}

function emptyEditors(): void {
  cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(3) > div > div > app-editor > div')
    .type('{selectall}{selectall}{selectall}{backspace}');
  cy.get('body > app-root > app-grid-view > mat-grid-list > div > mat-grid-tile:nth-child(2) > div > div > app-micro-editor > div')
    .type('{selectall}{selectall}{selectall}{backspace}');
}


// NOTE: You can use it like so:
Cypress.Commands.add('getDemoCode1', getDemoCode1);
Cypress.Commands.add('getDemoCode2', getDemoCode2);
Cypress.Commands.add('getDemoCode3', getDemoCode3);
Cypress.Commands.add('pushResetButton', pushResetButton);
Cypress.Commands.add('getDemoMicroPrograms', getDemoMicroPrograms);
Cypress.Commands.add('getStandardMicroPrograms', getStandardMicroPrograms);
Cypress.Commands.add('emptyEditors', emptyEditors);
Cypress.Commands.add('pushPlayButton', pushPlayButton);
//
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
