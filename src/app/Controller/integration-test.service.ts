import { Injectable } from '@angular/core';
import { MacroProviderService } from './macro-provider.service';
import { MacroTokenizerService } from './macro-tokenizer.service';

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



  constructor(private macroProvider: MacroProviderService, private macroTokenizer: MacroTokenizerService) { }

  testMacro(){
    try{
      this.macroTokenizer.initTest(this.macro); 
      console.log("Integration Test for Macroassembler SUCCESSFUL");
    }
    catch{
      console.error("Integration Test for Macroassembler FAILED");
    }   
  }
}
