import { state } from '@angular/animations';
import { ParseSourceFile, TokenType } from '@angular/compiler';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class MacroTokenizerService {
  regEx4identifier: string = "^[a-z]([a-zA-Z0-9]+)?"

  Spec: any= [
    // New Label: e.g Label1:
    [/^.*:/ , "NEW_LABEL"],

    // Whitespace
    [/^\s+/, null],

    // Comment
    [/^\/\/.*/, null],

    // Numbers:
    [/^\d+/, "NUMBER"],

    // Mnemonics
    [/^BIPUSH \d+/, "MNEMONIC"],
    [/^DUP/, "MNEMONIC"],
    [/^GOTO ([a-zA-Z0-9]+)/, "MNEMONIC"],
    [/^IADD/, "MNEMONIC"],
    [/^IAND/, "MNEMONIC"],
    [/^IFEQ ([a-zA-Z0-9]+)/, "MNEMONIC"],
    [/^IFLT ([a-zA-Z0-9]+)/, "MNEMONIC"],
    [/^IF_ICMPEQ ([a-zA-Z0-9]+)/, "MNEMONIC"],
    [/^IFICMPEQ ([a-zA-Z0-9]+)/, "MNEMONIC"],
    [/^IINC [a-z]([a-zA-Z0-9]+)? [a-z]([a-zA-Z0-9]+)?/, "MNEMONIC"],
    [/^ILOAD [a-z]([a-zA-Z0-9]+)?/, "MNEMONIC"],
    [/^INVOKEVIRTUAL [a-zA-Z]([a-zA-Z0-9]+)?/, "MNEMONIC"],
    [/^IOR/, "MNEMONIC"],
    [/^IRETURN/, "MNEMONIC"],
    [/^ISTORE [a-z]([a-zA-Z0-9]+)?/, "MNEMONIC"],
    [/^ISUB/, "MNEMONIC"],
    [/^LDC_W [a-z]([a-zA-Z0-9]+)?/, "MNEMONIC"],
    [/^LDCW [a-z]([a-zA-Z0-9]+)?/, "MNEMONIC"],
    [/^NOP/, "MNEMONIC"],
    [/^POP/, "MNEMONIC"],
    [/^SWAP/, "MNEMONIC"],
    [/^WIDE/, "MNEMONIC"],

    //Fields
    [/^.constant/, "FIELD"],
    [/^.main/, "FIELD"],
    [/^.var/, "FIELD"],
    [/^.method [a-zA-Z]([a-zA-Z0-9]+)?\(([a-z]([a-zA-Z0-9]+)?(, )?)*\)/, "FIELD"],

    //End Fields
    [/^.end-constant/, "FIELDEND"],
    [/^.end-main/, "FIELDEND"],
    [/^.end-var/, "FIELDEND"],
    [/^.end-method/, "FIELDEND"],

    //Constant & Variable
    [/^[a-z]([a-zA-Z0-9]+)? \d+/, "NEW_CONSTANT"],
    [/^[a-z]([a-zA-Z0-9]+)?/, "NEW_VARIABLE"]
  ];

  constantField: Boolean = false;
  
  private string: string = "";
  private curser: number = 0;

  init(row: string){
    //console.log(row);
    this.string = row;
    while(true){
      let token = this.getNextToken();
      if(token == null){
        break;
      }
      console.log(token);
    }
  }

  private hasMoreTokens(): Boolean {
    return this.curser < this.string.length;
  }

  private match(regexp: RegExp, string: string){
    const matched = regexp.exec(string);
    if (matched == null){
      return null
    }
    this.curser += matched[0].length;
    return matched[0];
  }

  getNextToken():Object{
    if (!this.hasMoreTokens()){
      return null;
    }
    
    const string = this.string.slice(this.curser);

    for (const [regexp, tokenType] of this.Spec){
      const tokenValue = this.match(regexp, string);

      // could not match this rule, try the other ones
      if (tokenValue == null) {
        continue;
      }
        
      // Skip null Token, e.g whitespace and comment
      if (tokenType == null) {
        return this.getNextToken();
      }

      if(tokenValue == ".constant"){
        this.constantField = true;      
      }
      
      return{
        type: tokenType,
        value: tokenValue,
      }
    }

    throw new SyntaxError(`Unexpected token: "${string[0]}"`); 
  }

}
