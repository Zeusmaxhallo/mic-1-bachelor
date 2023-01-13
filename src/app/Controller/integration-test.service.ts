import { Injectable } from '@angular/core';
import { MacroProviderService } from './macro-provider.service';
import { MacroTokenizerService } from './macro-tokenizer.service';
import { ParserService } from './Emulator/parser.service';
import { MicroTokenizerService } from './micro-tokenizer.service';
import { BBusService } from './Emulator/b-bus.service';
import { CBusService } from './Emulator/c-bus.service';
import { AluService } from './Emulator/alu.service';
import { ShifterService } from './Emulator/shifter.service';

export interface Token{
  type: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})

export class IntegrationTestService {

  macro: string = 
  `.constant // Do not indent constants
  c1 100
  c2 325
  .end-constant
  .main
  .var
    var1
    var2
  .end-var
    BIPUSH 10
    ISTORE var1
    BIPUSH 15
    ISTORE var2
    LDCW objref // objref is a constant = 0
    ILOAD var1
    ILOAD var2
    INVOKEVIRTUAL met // Calls met(var1, var2)
  .end-main
  
  .method met(p1, p2)
  .var
    tmp
  .end-var
    ILOAD p1
    ILOAD p2
    IADD
  add100:	LDCW c1
    IADD
    ISTORE tmp
    ILOAD tmp
    ILOAD tmp // Needs to be on the stack twice so it's there after a jump
    LDCW c2
    IFICMPEQ end
    GOTO add100
    DUP // From here on we just call some Instruction that are not called somewhere else just to test them
    IAND
    IFEQ add100
    IFLT add100
    IF_ICMPEQ add100 //Same as IFICMPEQ
    IINC tmp c1
    IOR
    ISUB
    LDC_W index
    NOP
    POP
    SWAP
    WIDE
  end:	IRETURN // tmp is still on the stack so we return it
  .end-method`;

  microInstructions: string[] = [
    "TOS = H + 1; wr", 
    "TOS=H+1", 
    "MDR = TOS", 
    "ior1:MAR=SP=SP-1; rd", 
    "MAR=SP-1; wr", 
    //"(0x57)pop1: MAR=SP=SP-1; rd;", 
    //"H=MBRU <<8", 
    //"OPC-H; if(Z) goto T; else goto F", 
    //"H = MBRU OR H", 
    //"PC=PC+1; fetch", 
    //"//Ein Kommentar", 
    //"T:OPC=PC-1;fetch; goto goto2"
  ];

  tokens: Token[] = null;


  constructor(
    private macroProvider: MacroProviderService, 
    private macroTokenizer: MacroTokenizerService, 
    private parserService: ParserService,
    private microTokenizer: MicroTokenizerService,
    private bBus: BBusService,
    private cBus: CBusService,
    private alu: AluService,
    private shifter: ShifterService
    ) { }


  //Tests the macro Tokenizer
  testMacro(){
    try{
      this.macroTokenizer.initTest(this.macro); 
      alert("Integration Test for Macroassembler SUCCESSFUL");
    } catch (error) {
      alert("Integration Test for Macroassembler FAILED");
    }  
  }

  // Tests the micro tokenizer and tokenizer, and also tests the BBus, CBus, ALU and the Shifter
  testMicro(){
    try {
      for(let i = 0; i < this.microInstructions.length; i++){
        this.microTokenizer.init(this.microInstructions[i]);
        this.tokens = this.microTokenizer.getAllTokens();
        
        this.parserService.init(this.tokens, 0);
        let parsedResult = this.parserService.parse();
        this.bBus.activate(parsedResult.b);
        let [result, _] = this.alu.calc(parsedResult.alu.slice(2));
        result = this.shifter.shift(parsedResult.alu.slice(0,2), result)
        this.cBus.activate(parsedResult.c,result);        
      } 
      alert("Integration Test for Microprograms SUCCESSFUL");
      
    } catch (error) {
      alert("Integration Test for Microprograms FAILED");
    }

  }
}
