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

  // these are incremented by 4 each time a var, const, etc. is stored in the memory, because they each take 4 bytes of space in the memory.
  private varNumber: number = 0;
  private constNumber: number = 0;
  private mainParsedTokenNumber = 0;
  private methodParsedTokenNumber = 0;

  private methodNumber = 0; // is incremented with 1024, because every method has 1024 byte space in the memory

  // The addresses where different areas in the memory start
  private startConstAddr: number = 2048;
  private startVarAddr: number = 4096;
  private startMainAddr: number = 0;
  private startMethodAddr: number = 8192;

  constructor(
    private macroTokenizer: MacroTokenizerService,
    private memory: MainMemoryService,
    private controlStore: ControlStoreService,
    ) { }

  parse(){
    this.tokens = this.macroTokenizer.getTokens();
    this.setConstant();

    while(this.tokens.length > 0){
      if(this.tokens[0].value === '.main'){
        this.mainBlock();
      }
      else if(this.tokens[0].value.slice(0, 7) === '.method'){
        this.methodBlock();
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
        this.memory.store_32(this.startConstAddr + this.constNumber, constValue, constName, 'constant');
        this.constants[constName] = this.startConstAddr + this.constNumber;
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
      this.setVariable(mainBlockArr, 0, endVarIndex, this.startVarAddr);
      this.varNumber += 4;
    }

    // instructions in the main field
    for(let instruction of mainBlockArr){
      let instructionToken = instruction.value.split(' ');
      console.log(instructionToken);

      for(let i = 0; i < instructionToken.length; i++){
        // The first element of instruction is always the instruction without parameters
        if(i == 0){
          let controlStoreAddresses = this.controlStore.getMicroAddr();
          let instructionAddress = controlStoreAddresses[instructionToken[0]];

          // Instruction that is already in the control store
          if(instructionAddress !== undefined){
            let addressToSave: number = this.startMainAddr + this.mainParsedTokenNumber;
            console.log("Address of " + instructionToken[0] + " is: " + instructionAddress);
            this.memory.store_32(addressToSave, instructionAddress, instructionToken[0], 'parsedInstruction')
            this.mainParsedTokenNumber += 4;
          }
          // Instruction that is not in the control store or label
          else{
            // If it ends with ':' than it is a label
            if(instructionToken[0].endsWith(':')){
              // save label and the address it points to, to the label dictionary in the memory
              this.memory.addItemToSavedItemDictionary(instructionToken[0], this.startMainAddr + this.mainParsedTokenNumber);
              console.log("Create Label " + instructionToken[0] + " that is pointing to " + this.memory.getSavedItemAdress(instructionToken[0]));
            }
            // Throws Error because unknown token
            else{
              // Comment in when microcode is fully available. And comment out the log
              // throw new Error("Unexpected Token: " + instructionToken[0]);
              console.log("Address of " + instructionToken[0] + " is: " + instructionAddress);              
            }
          }
        }
        // The following elements are parameters
        else{
          let address = this.memory.getSavedItemAdress(instructionToken[i]);
        
          // if address of the current parameter is not in the dictionary in the memory,
          // this Parameter is ether a method name, new constant with value 0 or an constant 
          // with a value that is defined in the token(happens with BIPUSH only)
          if(address === undefined){ 
            // The case that it is a method name         
            if(instructionToken[0] === 'INVOKEVIRTUAL'){
              // creates method with name and the address it will begin in the method dictionary
              let tokenAddr: number = this.startMethodAddr + this.methodNumber;
              this.memory.addMethodToDictionary(instructionToken[i], tokenAddr);
              this.methodNumber += 1024;
              console.log("Address of " + instructionToken[i] + " is: " + tokenAddr);

              // saves the address of the method that will be invoked to the main memory after the INVOKEVIRTUAL
              let saveToAddress = this.startMainAddr + this.mainParsedTokenNumber;
              this.memory.store_32(saveToAddress, this.memory.getSavedItemAdress(instructionToken[i]), instructionToken[i], 'parsedParameter')
              this.mainParsedTokenNumber += 4;
            }
            // The case with BIPUSH where a constant with a spezific value is created
            else if(instructionToken[0] === 'BIPUSH'){
              let value: number = +instructionToken[i];
              let generatedConstantName = "generatedConstantNameNumber";
              this.memory.store_32(this.startConstAddr + this.constNumber, value, generatedConstantName + this.constNumber, 'constant');
              address = this.memory.getSavedItemAdress(generatedConstantName + this.constNumber);
              this.constNumber += 4;
              console.log("Address of " + instructionToken[i] + " is " + address); 

              let saveToAddr: number = this.startMainAddr + this.mainParsedTokenNumber;
              this.memory.store_32(saveToAddr, address, instructionToken[i], 'parsedParameter');
              this.mainParsedTokenNumber += 4;
            }
            // The case that it is a constant with value 0
            else{
              // create constant with value 0 and get it's address
              this.memory.store_32(this.startConstAddr + this.constNumber, 0, instructionToken[i], 'constant');
              address = this.memory.getSavedItemAdress(instructionToken[i]);
              console.log("Address of " + instructionToken[i] + " is: " + address);

              // store address as a parameter to the last instruction
              this.memory.store_32(this.startMainAddr + this.mainParsedTokenNumber, address, instructionToken[i], 'parsedParameter');
              this.mainParsedTokenNumber += 4;
            }
          }
          // The case that the parameter is already in the Dictionary in the memory
          else{
            console.log("Address of " + instructionToken[i] + " is: " + address);

            // store address as a parameter to the last instruction
            this.memory.store_32(this.startMainAddr + this.mainParsedTokenNumber, address, instructionToken[0], 'parsedParameter');
            this.mainParsedTokenNumber += 4;
          }  
        }
      }
    }
        
    this.tokens.splice(startMainIndex, endMainIndex + 1);
  }

  private methodBlock(){
    let startMethodIndex: number;
    let endMethodIndex: number;

    // finds start and end of method field
    for(let i = 0; i < this.tokens.length; i++){
      if(this.tokens[0].value.slice(0, 7) === '.method'){
        startMethodIndex = i;
        for(let j = i; j < this.tokens.length; j++){
          if(this.tokens[j].value === '.end-method'){
            endMethodIndex = j;
            break;
          }
        }
        if(endMethodIndex === 0){
          throw new Error("Methodfield not closed. Close it with .end-method");
        }
        break;
      }
    }

    let methodBlockArr: Token[] = [];
    methodBlockArr = this.tokens.slice(startMethodIndex + 1, endMethodIndex);    

    // var field inside the main field
    if(methodBlockArr[0].type === 'FIELD'){
      if(methodBlockArr[0].value !== '.var'){
        throw new Error("This Field is not allowed in this scope: " + methodBlockArr[0].value);
      }

      // just find endVarIndex because the start is always mainBlockArr[0].value
      let endVarIndex = 0;
      for(let i = 0; i < methodBlockArr.length; i++){
        if(methodBlockArr[i].value === '.end-var'){
          endVarIndex = i;
          break;
        }
      }

      if(endVarIndex === 0){
        throw new Error("Variablefield not closed. Close it with .end-var");
      }
      this.setVariable(methodBlockArr, 0, endVarIndex, this.startVarAddr);
      this.varNumber += 4;
    }

    // instructions in the main field
    for(let instruction of methodBlockArr){
      let instructionToken = instruction.value.split(' ');
      console.log(instructionToken);

      for(let i = 0; i < instructionToken.length; i++){
        // The first element of instruction is always the instruction without parameters
        if(i == 0){
          let controlStoreAddresses = this.controlStore.getMicroAddr();
          let instructionAddress = controlStoreAddresses[instructionToken[i]];

          // Instruction that is already in the control store
          if(instructionAddress !== undefined){
            console.log("Address of " + instructionToken[0] + " is: " + instructionAddress);
            this.memory.store_32(this.startMethodAddr + this.methodParsedTokenNumber, instructionAddress, instructionToken[0], 'parsedInstructionMethod')
            this.methodParsedTokenNumber += 4;
          }
          // Instruction that is not in the control store or label
          else{
            // If it ends with ':' than it is a label
             if(instructionToken[0].endsWith(':')){
              // save label and the address it points to to the label dictionary in memory
              this.memory.addItemToSavedItemDictionary(instructionToken[0], this.startMethodAddr + this.methodParsedTokenNumber);
              console.log("Create Label " + instructionToken[0] + " that is pointing to " + this.startMethodAddr + this.methodParsedTokenNumber);
             }
             // Throws Error because unknown token
             else{
              // Comment in when microcode is fully available. And comment out the log
              // throw new Error("Unexpected Token: " + instructionToken[0]);
              console.log("Address of " + instructionToken[0] + " is: " + instructionAddress);
             }
          }
        }
        // The following elements are parameters
        else{
          let address = this.memory.getSavedItemAdress(instructionToken[i]);
        
          // if address of the current parameter is not in the dictionary in the memory,
          // this Parameter is ether a method name, new constant with value 0 or an constant 
          // with a value that is defined in the token(happens with BIPUSH only)
          if(address === undefined){ 
            // The case that it is a method name         
            if(instructionToken[0] === 'INVOKEVIRTUAL'){
              // creates method with name and the address it will begin in the method dictionary
              let tokenAddr: number = this.startMethodAddr + this.methodNumber;
              this.memory.addMethodToDictionary(instructionToken[i], tokenAddr);
              this.methodNumber += 1024;
              console.log("Address of " + instructionToken[i] + " is: " + tokenAddr);

              // saves the address of the method that will be invoked to the main memory after the INVOKEVIRTUAL
              let savetoAddr = this.startMethodAddr + this.methodParsedTokenNumber;
              this.memory.store_32(savetoAddr, this.memory.getSavedItemAdress(instructionToken[i]), instructionToken[i], 'parsedParameter');
              this.methodParsedTokenNumber += 4;
            }
            // The case with BIPUSH where a constant with a spezific value is created
            else if(instructionToken[0] === 'BIPUSH'){
              let value: number = +instructionToken[i];
              let generatedConstantName = "generatedConstantNameNumber";
              this.memory.store_32(this.startConstAddr + this.constNumber, value, generatedConstantName + this.constNumber, 'constant');
              address = this.memory.getSavedItemAdress(generatedConstantName + this.constNumber);
              this.constNumber += 4;
              console.log("Address of " + instructionToken[i] + " is " + address);
              let saveToAddr: number = this.startMethodAddr + this.methodParsedTokenNumber;
              this.memory.store_32(saveToAddr, address, instructionToken[i], 'parsedParameter');
              this.methodParsedTokenNumber += 4;            
            }
            // The case that it is a constant with value 0
            else{
              // create constant with value 0 and get it's address
              this.memory.store_32(this.startConstAddr + this.constNumber, 0, instructionToken[i], 'constant');
              address = this.memory.getSavedItemAdress(instructionToken[i]);
              console.log("Address of " + instructionToken[i] + " is: " + address);

              // store address as a parameter to the last instruction
              this.memory.store_32(this.startMethodAddr + this.methodParsedTokenNumber, address, instructionToken[i], 'parsedParameter');
              this.methodParsedTokenNumber += 4;
            }
          }
          // The case that the parameter is already in the Dictionary in the memory
          else{
            console.log("Address of " + instructionToken[i] + " is: " + address);

            // store address as a parameter to the last instruction
            this.memory.store_32(this.startMethodAddr + this.methodParsedTokenNumber, address, instructionToken[0], 'parsedParameter');
            this.methodParsedTokenNumber += 4;
          }  
        }
      }
    }

    this.tokens.splice(startMethodIndex, endMethodIndex + 1); // methodblock is sliced out of the tokens when the block is parsed
    this.methodParsedTokenNumber = 0; // happens because the next methodblock needs to start on the first byte again. It means the first token on the new methodblock is the first token on this new block.
  }
}