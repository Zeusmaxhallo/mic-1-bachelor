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

  private constantOffsetToCPP: {[name: string]: number} = {};
  private variableOffsetToLV: {[name: string]: number} = {};
  private labels: {[name: string]: number} = {};
  private methods: {[name: string]: number} = {};

  private parsedCode: number[] = [];
  private constants: number[] = [];
  private variables: number[] = [];

  private varNumber: number = 0;
  private constNumber: number = 0;
  private parsedTokenNumber = 0;
  private methodNumber = 0;

  constructor(
    private macroTokenizer: MacroTokenizerService,
    private memory: MainMemoryService,
    private controlStore: ControlStoreService,
    ) { }

  parse(){
    this.resetParser();

    this.tokens = this.macroTokenizer.getTokens();
    this.setConstant();
    this.searchMethods();

    while(this.tokens.length > 0){
      if(this.tokens[0].value === '.main'){
        //Adds a Invoke to this main method at the address where this main method begins
        this.parsedCode.push(182); // 182 is the Adress of INVOKEVIRTUAL
        const buffer = new ArrayBuffer(2);
        const view = new DataView(buffer, 0);
        view.setInt16(0, this.methods["main"]); 
        this.parsedCode.push(view.getUint8(0));
        this.parsedCode.push(view.getUint8(1))
        this.parsedTokenNumber += 3;
          
        this.mainBlock();
      }
      else if(this.tokens[0].value.slice(0, 7) === '.method'){
        let methodStr = this.tokens[0].value.slice(8);
        let methodName = methodStr.slice(0, methodStr.indexOf("("));

        //Adds a Invoke to this method at the address where this method begins
        this.parsedCode.push(182); // 182 is the Adress of INVOKEVIRTUAL
        const buffer = new ArrayBuffer(2);
        const view = new DataView(buffer, 0);
        view.setInt16(0, this.methods[methodName]); 
        this.parsedCode.push(view.getUint8(0));
        this.parsedCode.push(view.getUint8(1))
        this.parsedTokenNumber += 3;

        this.methodBlock();
      }
      else{
        throw new Error("Unexpected Token: " + this.tokens[0].value);
      }
    }
    this.memory.setCode(this.parsedCode);
    this.memory.setConstants(this.constants);
    this.memory.createVariables(this.variables.length);

    this.memory.printMemory();
  }

  resetParser(){
    this.tokens = null;
    this.constantOffsetToCPP = {};
    this.variableOffsetToLV = {};
    this.labels = {};
    this.methods = {}
    this.parsedCode = [];
    this.constants = [];
    this.variables = [];
    this.varNumber = 0;
    this.constNumber = 0;
    this.parsedTokenNumber = 0;
    this.methodNumber = 0;
  }

  // saves the constants with a value to the Main Memory and slices the constant field and the constant tokens out from the tokensarray
  private setConstant(){
    let startConstIndex = 0;
    let endConstIndex = 0;
    let constArr: Token[];

    // sets startConstIndex and endConstIndex
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

    // If there is no constant field
    if(startConstIndex === endConstIndex){
      return;
    }

    constArr = this.tokens.slice(startConstIndex + 1, endConstIndex);
    for(let constant of constArr){
      if(constant.type === 'NEW_CONSTANT'){
        let constName = constant.value.split(' ')[0];
        let constValue: number = parseInt(constant.value.split(' ')[1]);

        this.constantOffsetToCPP[constName] = this.constNumber;
        this.constNumber += 1;
        this.constants.push(constValue);
      }else{
        throw new Error("The following should not be in the constant field. \nType: " + constant.type + ", Value: " + constant.value);
      }
    }

    console.table(constArr);
    this.tokens.splice(startConstIndex, endConstIndex + 1);
  }

  // saves the variables with the default value 0 and slices the value field and variable tokens out from the tokensarray
  private setVariable(arr: Token[]){
    // just find endVarIndex because the start is always mainBlockArr[0].value
    let startVarIndex = 0;
    let endVarIndex = 0;
    for(let i = 0; i < arr.length; i++){
      if(arr[i].value === '.end-var'){
        endVarIndex = i;
        break;
      }
    }
    if(endVarIndex === 0){
      throw new Error("Variablefield not closed. Close it with .end-var");
    }   

    let varArr = arr.slice(startVarIndex + 1, endVarIndex);
    for(let variable of varArr){
      if(variable.type === "NEW_VARIABLE"){
        let varName: string = variable.value;

        this.varNumber += 1;
        this.variableOffsetToLV[varName] = this.varNumber;
        this.variables.push(0);
      }else{
        throw new Error("The following should not be in the variable field. \nType: " + variable.type + ", Value: " + variable.value);
      }
    }
    console.table(varArr);
    arr.splice(startVarIndex, varArr.length + 2);    
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

    // new array with only the main block
    let mainBlockArr: Token[] = [];
    mainBlockArr = this.tokens.slice(startMainIndex + 1, endMainIndex);    

    // var field inside the main field
    if(mainBlockArr[0].type === 'FIELD'){
      if(mainBlockArr[0].value !== '.var'){
        throw new Error("This Field is not allowed in this scope: " + mainBlockArr[0].value);
      }   
      this.setVariable(mainBlockArr);
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
            this.parsedCode.push(instructionAddress);
            this.parsedTokenNumber += 1;
          }
          // Instruction that is not in the control store or label
          else{
            // If it ends with ':' than it is a label
            if(instructionToken[0].endsWith(':')){
              // save label and the address it points to, to the labels dictionary
              this.labels[instructionToken[0]] = this.parsedTokenNumber + 1;
              console.log("Create Label " + instructionToken[0] + " that is pointing to parsed token " + this.labels[instructionToken[0]]);
            }
            // Throws Error because unknown token
            else{
              // Comment in when microcode is fully available. And comment out the log
              // throw new Error("Unexpected Token: " + instructionToken[0]);
              console.error("Address of " + instructionToken[0] + " is: " + instructionAddress);              
            }
          }
        }

        // ------------------------------------ This mainBlock method is from here on not complete ------------------------------------

        // The following elements are parameters
        else{
          // if parsedParameter is not undefined after this, the parameter is a constant
          let parsedParameter = this.constantOffsetToCPP[instructionToken[i]];
          if(parsedParameter !== undefined && instructionToken[i-1] === "LDC_W"){
            let parsedParameterTmp = parsedParameter;
            const buffer = new ArrayBuffer(2);
            const view = new DataView(buffer, 0);
            view.setInt16(0, parsedParameterTmp); 
            this.parsedCode.push(view.getUint8(0));
            this.parsedTokenNumber += 1;
            parsedParameter = view.getUint8(1);
          }
          
          // if parsedParameter is not undefined after this, the parameter is a variable
          if(parsedParameter === undefined){
            parsedParameter = this.variableOffsetToLV[instructionToken[i]];
          }

          // if parsedParameter is not NaN after this, the parameter is a byte
          if(parsedParameter === undefined){
            parsedParameter = +instructionToken[i];
          }
          
          // If parsed Parameter is NaN than it must be a offset or method
          // Case for method
          if(instructionToken[i-1] === "INVOKEVIRTUAL"){
            const buffer = new ArrayBuffer(2);
            const view = new DataView(buffer, 0);
            view.setInt16(0, this.methods[instructionToken[i]]); 
            this.parsedCode.push(view.getUint8(0));
            this.parsedTokenNumber += 1;
            parsedParameter = view.getUint8(1);
          }
          // Case for label
          else{
            if(isNaN(parsedParameter)){
              let label = this.labels[instructionToken[i] + ":"];
              let offset: number = 0;
              if(label !== undefined){
                offset = label - this.parsedTokenNumber;
                console.log("OFFSET: " + offset);
                const buffer = new ArrayBuffer(2);
                const view = new DataView(buffer, 0);
                view.setInt16(0, offset); 
                this.parsedCode.push(view.getUint8(0));
                this.parsedTokenNumber += 1;
                parsedParameter = view.getUint8(1);
              }
              else{
                // search where the label is in the later code and calculate offset
                let labelTokenPosition = 0;
                for(let instruction2 of mainBlockArr){
                  let instructionToken2 = instruction2.value.split(' ');          
                  for(let j = 0; j < instructionToken.length; j++){
                    if(instructionToken2[j] === instructionToken[i] + ":"){
                      labelTokenPosition += 1;
                      offset = labelTokenPosition - this.parsedTokenNumber;
                      break;
                    }
                    if(offset !== 0){
                      break;
                    }
                    else{
                      if(instructionToken2[j-1] === "GOTO" || instructionToken2[j-1] === "IF_ICMPEQ" 
                      || instructionToken2[j-1] === "IFEQ" || instructionToken2[j-1] === "IFLT" 
                      || instructionToken2[j-1] === "INVOKEVIRTUAL" || instructionToken2[j-1] === "LDC_W"){
                        labelTokenPosition += 2;
                      }
                      else if(instructionToken2[j] === undefined || instructionToken2[j].endsWith(":")){
                        continue;
                      }
                      else{
                        labelTokenPosition += 1;
                      }
                    }
                  }
                }

                if(labelTokenPosition > 0 && offset !== 0){
                  console.log("OFFSET: " + offset);
                  const buffer = new ArrayBuffer(2);
                  const view = new DataView(buffer, 0);
                  view.setInt16(0, offset); 
                  this.parsedCode.push(view.getUint8(0));
                  this.parsedTokenNumber += 1;
                  parsedParameter = view.getUint8(1);
                }
                else{
                  // throw new Error("Unexpected token: " + instructionToken[i]);
                }
              }
            }
          }

          console.log(parsedParameter);
          this.parsedCode.push(parsedParameter);
          this.parsedTokenNumber += 1;
        }
      }
    }
  
    // mainblock is sliced out of the tokens when the block is parsed
    this.tokens.splice(startMainIndex, endMainIndex + 1); 
  }

  private methodBlock(){
    let startMethodIndex: number;
    let endMethodIndex: number;
    let startTokenNumberMethod = this.parsedTokenNumber;

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

    // new array with only the method block
    let methodBlockArr: Token[] = [];
    methodBlockArr = this.tokens.slice(startMethodIndex + 1, endMethodIndex);    

    // var field inside the main field
    if(methodBlockArr[0].type === 'FIELD'){
      if(methodBlockArr[0].value !== '.var'){
        throw new Error("This Field is not allowed in this scope: " + methodBlockArr[0].value);
      }
      this.setVariable(methodBlockArr);
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
            this.parsedCode.push(instructionAddress);
            this.parsedTokenNumber += 1;
          }
          // Instruction that is not in the control store or label
          else{
            // If it ends with ':' than it is a label
             if(instructionToken[0].endsWith(':')){
              // save label and the address it points to to the label dictionary in memory
              this.labels[instructionToken[0]] = this.parsedTokenNumber + 1;
              console.log("Create Label " + instructionToken[0] + " that is pointing to " + this.labels[instructionToken[0]]);
             }
             // Throws Error because unknown token
             else{
              // Comment in when microcode is fully available. And comment out the log
              // throw new Error("Unexpected Token: " + instructionToken[0]);
              console.log("Address of " + instructionToken[0] + " is: " + instructionAddress);
             }
          }
        }

        // ------------------------------------ This mainBlock method is from here on not complete ------------------------------------

        // The following elements are parameters
        else{
          // if parsedParameter is not undefined after this, the parameter is a constant
          let parsedParameter = this.constantOffsetToCPP[instructionToken[i]];
          if(parsedParameter !== undefined && instructionToken[i-1] === "LDC_W"){
            let parsedParameterTmp = parsedParameter;
            const buffer = new ArrayBuffer(2);
            const view = new DataView(buffer, 0);
            view.setInt16(0, parsedParameterTmp); 
            this.parsedCode.push(view.getUint8(0));
            this.parsedTokenNumber += 1;
            parsedParameter = view.getUint8(1);
          }

          // if parsedParameter is not undefined after this, the parameter is a variable
          if(parsedParameter === undefined){
            parsedParameter = this.variableOffsetToLV[instructionToken[i]];
          }

          // if parsedParameter is not NaN after this, the parameter is a byte
          if(parsedParameter === undefined){
            parsedParameter = +instructionToken[i];
          }

          // If parsed Parameter is NaN than it must be a offset or method
          // Case for method
          if(instructionToken[i-1] === "INVOKEVIRTUAL"){
            console.log("ITS A METHOD NAME");
          }
          // Case for label
          else{
            if(isNaN(parsedParameter)){
              let label = this.labels[instructionToken[i] + ":"];
              let offset: number = 0;
              if(label !== undefined){
                offset = label - this.parsedTokenNumber;
                console.log("OFFSET: " + offset);
                const buffer = new ArrayBuffer(2);
                const view = new DataView(buffer, 0);
                view.setInt16(0, offset); 
                this.parsedCode.push(view.getUint8(0));
                this.parsedTokenNumber += 1;
                parsedParameter = view.getUint8(1);
              }
              else{
                // search where the label is in the later code and calculate offset
                let labelTokenPosition = startTokenNumberMethod;
                for(let instruction2 of methodBlockArr){
                  let instructionToken2 = instruction2.value.split(' ');          
                  for(let j = 0; j < instructionToken.length; j++){
                    if(instructionToken2[j] === instructionToken[i] + ":"){
                      labelTokenPosition += 1;
                      offset = (labelTokenPosition) - this.parsedTokenNumber;
                      break;
                    }
                    if(offset !== 0){
                      break;
                    }
                    else{
                      if(instructionToken2[j-1] === "GOTO" || instructionToken2[j-1] === "IF_ICMPEQ" 
                      || instructionToken2[j-1] === "IFEQ" || instructionToken2[j-1] === "IFLT" 
                      || instructionToken2[j-1] === "INVOKEVIRTUAL" || instructionToken2[j-1] === "LDC_W"){
                        labelTokenPosition += 2;
                      }
                      else if(instructionToken2[j] === undefined || instructionToken2[j].endsWith(":")){
                        continue;
                      }
                      else{
                        labelTokenPosition += 1;
                      }
                    }
                  }
                }
                
                if(labelTokenPosition > 0 && offset !== 0){
                  console.log("OFFSET: " + offset);
                  const buffer = new ArrayBuffer(2);
                  const view = new DataView(buffer, 0);
                  view.setInt16(0, offset); 
                  this.parsedCode.push(view.getUint8(0));
                  this.parsedTokenNumber += 1;
                  parsedParameter = view.getUint8(1);
                }
                else{
                  // throw new Error("Unexpected token: " + instructionToken[i]);
                }
              }
            }
          }
          
          console.log(parsedParameter);
          this.parsedCode.push(parsedParameter);
          this.parsedTokenNumber += 1;
        }
      }
    }

    // methodblock is sliced out of the tokens when the block is parsed
    this.tokens.splice(startMethodIndex, endMethodIndex + 1); 
  }

  searchMethods(){
    for(let token of this.tokens){
      let methodStr = this.tokens[0].value.slice(8);

      if(token.type === "FIELD" && token.value === ".main"){
        this.methodNumber += 1;
        this.methods["main"] = this.methodNumber;
      }

      if(token.type === "FIELD" && token.value.slice(0, 7) === ".method"){
        let methodStr = token.value.slice(8);
        let methodName = methodStr.slice(0, methodStr.indexOf("("));
        this.methodNumber += 1;
        this.methods[methodName] = this.methodNumber;
      }
    }
  }
}