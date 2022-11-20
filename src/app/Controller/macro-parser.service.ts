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

  private varNumber: number = 0;
  private constNumber: number = 0;

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
    this.constNumber = 0;
    for(let constant of constArr){
      if(constant.type === 'NEW_CONSTANT'){
        let constName = constant.value.split(' ')[0];
        let constValue: number = parseInt(constant.value.split(' ')[1]);
        this.memory.store_32(1024 + this.constNumber, constValue, constName, 'constant');
        this.constants[constName] = 1024 + this.constNumber;
        this.constNumber += 4;
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
    this.varNumber = 0;
    for(let variable of varArr){
      if(variable.type === "NEW_VARIABLE"){
        let varName: string = variable.value;
        this.memory.store_32(addrLocalVar + this.varNumber, 0, varName, 'variable');
        this.variables[varName] = addrLocalVar + this.varNumber;
        this.varNumber += 4;
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

      for(let i = 0; i < instructionToken.length; i++){
        // The first element of instruction is always the instruction without parameters
        if(i == 0){
          let controlStoreAddresses = this.controlStore.getMicroAddr();
          let instructionAddress = controlStoreAddresses[instructionToken[i]];
          console.log("Address of " + instructionToken[i] + " is: " + instructionAddress);
        }
        // The following elements are parameters
        else{
          let parameter = instructionToken[i];
          let address = this.memory.getSavedItemAdress(parameter);

          if(address !== undefined){
            console.log("Address of " + instructionToken[i] + " is: " + address);            
          }

          // // instruction with byte as parameter. The byte is saved as a variable first
          // if(instruction.type === 'MNEMONIC_DIGIT'){
          //   let generatedVariableName = "generatedVariableNameNumber";
          //   let value: number = +instructionToken[i];
          //   this.memory.store_32(this.varNumber, value, generatedVariableName + this.varNumber, 'variable');
          //   let address = this.memory.getSavedItemAdress(generatedVariableName + this.varNumber);
          //   this.varNumber += 4;
          //   console.log("Address of " + instructionToken[i] + " is: " + address);
          // }
          // // instruction with any other type of parameter than byte.
          // else if(instruction.type === 'MNEMONIC'){
          //   let address = this.memory.getSavedItemAdress(instructionToken[i]);
          //   // The case when the parameter is a reference to a constant that is not declared yet. Creates new constant with value 0
          //   if(address === undefined){
          //     this.memory.store_32(this.constNumber, 0, instructionToken[i], 'constant');
          //     address = this.memory.getSavedItemAdress(instructionToken[i]);
          //     this.constNumber += 4;
          //   }
          //   console.log("Address of " + instructionToken[i] + " is: " + address);
          // }
          // else{
          //   throw new Error("Unexpected Token: " + instruction);
          // }
          
        }
      }
      
      
    }
  }

  private methodBlock(){

  }
}