import { Injectable } from '@angular/core';
import { ControlStoreService } from './Emulator/control-store.service';
import { MainMemoryService } from './Emulator/main-memory.service';
import { MacroTokenizerService } from './macro-tokenizer.service';
import { Token } from './micro-tokenizer.service';

@Injectable({
  providedIn: 'root'
})
export class MacroParserService {
  tokens: Token[] = null;
  private constants: {[name: string]: number} = {};
  private variables: {[name: string]: number} = {};

  constructor(
    private macroTokenizer: MacroTokenizerService,
    private memory: MainMemoryService,
    private controlStore: ControlStoreService,
    ) { }

  parse(){
    this.tokens = this.macroTokenizer.getTokens();
    this.setConstant();
    
    while(this.tokens[0].type === 'FIELD'){      
      if(this.tokens[0].value === '.main'){
        this.mainBlock();
        break;
      }
      else if(this.tokens[0].value.slice(0, 7) === '.method'){
        this.methodBlock();
        break;
      }
      else{
        throw new Error("Unexpected Token: " + this.tokens[0].value);
      }
    }

    this.memory.printMemory();
  }

  // saves the constants with a value to the Main Memory and slices the constant field and the constant tokens out from the tokensarray
  private setConstant(){
    let startConstIndex = 0;
    let endConstIndex = 0;
    let constArr: Token[];

    for(let i = 0; i < this.tokens.length; i++){
      if(this.tokens[i].value === '.constant'){
        startConstIndex = i;
        for(let j = i; j < this.tokens.length; j++){
          if(this.tokens[j].value === '.end-constant'){
            endConstIndex = j;
            break;
          }
        }
        if(endConstIndex === 0){
          throw new Error("Constantfield not closed. Close it with .end-constant");
        }
        break;
      }
    }

    constArr = this.tokens.slice(startConstIndex + 1, endConstIndex);
    let constNumber = 0;
    for(let constant of constArr){
      if(constant.type === 'NEW_CONSTANT'){
        let constName = constant.value.split(' ')[0];
        let constValue: number = parseInt(constant.value.split(' ')[1]);
        this.memory.store_32(1024 + constNumber, constValue);
        this.constants[constName] = 1024 + constNumber;
        constNumber += 4;
      }else{
        throw new Error("The following should not be in the constant field. \nType: " + constant.type + ", Value: " + constant.value);
      }
    }

    if(constArr.length > 0){
      console.log(constArr);
      
      this.tokens.splice(startConstIndex, endConstIndex + 1);
    }
  }

  // saves the variables with the default value 0 and slices the value field and variable tokens out from the tokensarray
  private setVariable(arr: Token[], startVarIndex: number, endVarIndex: number, addrLocalVar: number){
    let varArr = arr.slice(startVarIndex + 1, endVarIndex);
    let varNumber = 0;
    for(let variable of varArr){
      if(variable.type === "NEW_VARIABLE"){
        let varName: string = variable.value;
        this.memory.store_32(addrLocalVar + varNumber, 0);
        this.variables[varName] = addrLocalVar + varNumber;
        varNumber += 4;
      }else{
        throw new Error("The following should not be in the variable field. \nType: " + variable.type + ", Value: " + variable.value);
      }
    }

    if(varArr.length > 0){
      console.log(varArr);
      arr.splice(startVarIndex, varArr.length + 2);
    }
  }

  private mainBlock(){
    let startMainIndex: number;
    let endMainIndex: number;

    // finds start and end of main field
    for(let i = 0; i < this.tokens.length; i++){
      if(this.tokens[i].value === '.main'){
        startMainIndex = i;
        for(let j = i; j < this.tokens.length; j++){
          if(this.tokens[j].value === '.end-main'){
            endMainIndex = j;
            break;
          }
        }
        if(endMainIndex === 0){
          throw new Error("Mainfield not closed. Close it with .end-main");
        }
        break;
      }
    }

    let mainBlockArr: Token[] = [];
    mainBlockArr = this.tokens.slice(startMainIndex + 1, endMainIndex);    

    // var field inside the main field
    if(mainBlockArr[0].type === 'FIELD'){
      if(mainBlockArr[0].value !== '.var'){
        throw new Error("This Field is not allowed in this scope: " + mainBlockArr[0].value);
      }

      // just find endVarIndex because the start is always mainBlockArr[0].value
      let endVarIndex = 0;
      for(let i = 0; i < mainBlockArr.length; i++){
        if(mainBlockArr[i].value === '.end-var'){
          endVarIndex = i;
          break;
        }
      }

      if(endVarIndex === 0){
        throw new Error("Variablefield not closed. Close it with .end-var");
      }
      this.setVariable(mainBlockArr, 0, endVarIndex, 0);
    }

    // instructions in the main field
    for(let instruction of mainBlockArr){
      let instructionToken = instruction.value.split(' ');
      console.log(instructionToken);
      


      // switch (instructionToken.length) {
      //   case 1:
      //     console.log(this.noParameter(instructionToken[0]));
      //     break;
      //   case 2:
      //     break;
      //   case 3:
      //     break;      
      //   default:
      //     throw new Error("Invalid number of parameters!");
      // }
    }
  }

  private methodBlock(){

  }

  private noParameter(instruction: string){
    const instructionDict: {[name: string]: number} = {
      "IAND": this.controlStore.getMicroAddr()['iand1'],
      "DUP": this.controlStore.getMicroAddr()['dup1'],
      //Hier die fehlenden Instructions noch hinzufügen wenn der microparser fertig ist
    };

    if(!(instruction in instructionDict)){
      throw new Error("Unknown instruction: " + instruction);
    }

    return instructionDict[instruction];
  }
}