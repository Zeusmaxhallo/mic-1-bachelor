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
  private methods: {[name: string]: number} = {}; // gives a number that is a offset to a const. The value of this const is the startingpoint of this method
  private methodsParameterNumber: {[name: string]: number} = {}; // gives the number of parameters for a method

  private parsedCode: number[] = [];
  private constants: number[] = [];
  private variables: number[] = [];

  private varNumber: number = 0;
  private constNumber: number = 0;
  private parsedTokenNumber: number = 0;
  private methodNumber: number = 0;
  private currentLocalVarCount: number = 0; // temporary saves the number of current local variables when setVariable() is invoked

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
        // Adds a Invoke to this main method at the address where this main method begins
        this.parsedCode.push(182); // 182 is the Adress of INVOKEVIRTUAL
        const buffer = new ArrayBuffer(2);
        const view = new DataView(buffer, 0);
        view.setInt16(0, this.methods["main"]);
        this.parsedCode.push(view.getUint8(0));
        this.parsedCode.push(view.getUint8(1));
        view.setInt16(0, this.methods["main"]);
        this.parsedCode.push(view.getUint8(0));
        this.parsedCode.push(view.getUint8(1));
        this.parsedTokenNumber += 1; 
        console.log("---------PARSEDTOKENNUMBER: " + this.parsedTokenNumber + "|main anfang: +5")
          
        this.mainBlock();
      }
      else if(this.tokens[0].value.slice(0, 7) === '.method'){
        let methodStr = this.tokens[0].value.slice(8);
        let methodName = methodStr.slice(0, methodStr.indexOf("("));

        // Adds a Invoke to this method at the address where this method begins
        const buffer = new ArrayBuffer(2);
        const view = new DataView(buffer, 0);
        view.setInt16(0, this.methodsParameterNumber[methodName] + 1); // +1 because objref is also always a parameter 
        this.parsedCode.push(view.getUint8(0));
        this.parsedCode.push(view.getUint8(1))
        this.parsedTokenNumber += 2;
        console.log("---------PARSEDTOKENNUMBER: " + this.parsedTokenNumber + "|anzahl parameter für methodeanfang: +2")

        this.methodBlock();
      }
      else{
        throw new Error("Unexpected Token: " + this.tokens[0].value);
      }
    }
    this.memory.setCode(this.parsedCode);
    this.memory.setConstants(this.constants);
    this.memory.createVariables(this.variables.length);

    console.log("Memory: ");
    this.memory.printMemory();
    console.log("constantnames and their offset to CPP: ");
    console.table(this.constantOffsetToCPP)
    console.log("constant offsets and the value of the constant: ");
    console.table(this.constants)
    console.log("list of Methods: ");
    console.table(this.methods)
    console.log("variablenames and their offset to LV: ");
    console.table(this.variableOffsetToLV)
    console.log("variable offsets and the value of the variable at the end: ");
    console.table(this.variables)
  }

  resetParser(){
    this.tokens = null;
    this.constantOffsetToCPP = {};
    this.variableOffsetToLV = {};
    this.labels = {};
    this.methods = {}
    this.methodsParameterNumber = {};
    this.parsedCode = [];
    this.constants = [];
    this.variables = [];
    this.varNumber = 0;
    this.constNumber = 0;
    this.parsedTokenNumber = 0; // 1 tokenized token can also lead to more than 1 parsed varlues in the memory
    this.methodNumber = 0;
  }

  // saves the constants with a value to the Main Memory and slices the constant field and the constant tokens out from the tokensarray
  private setConstant(){
    let startConstIndex = 0;
    let endConstIndex = 0;
    let constArr: Token[];

    //create objref with value 0 once
    let constName = "objref"
    let constValue: number = 0;
    this.constantOffsetToCPP[constName] = this.constNumber;
    this.constNumber += 1;
    this.constants.push(constValue);

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
    console.log("objref = 0 is also saved as a constant, but is not listed hiere. The offset to CPP is 0")
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
    this.currentLocalVarCount = varArr.length
    console.log("LOCAL VARIABLE COUNT: " + (varArr.length));
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

      // writes the number of local variables to the memory
      const buffer = new ArrayBuffer(2);
      const view = new DataView(buffer, 0);
      view.setInt16(0, this.currentLocalVarCount);
      this.parsedCode.push(view.getUint8(0));
      this.parsedCode.push(view.getUint8(1));
      this.parsedTokenNumber += 2;
      console.log("---------PARSEDTOKENNUMBER: " + this.parsedTokenNumber + "|number of local variables: +2")
      this.currentLocalVarCount = 0; // reverts the value back to 0, so the next invokation of setVariable() can again count the right number of local variables
    }
    else{
      const buffer = new ArrayBuffer(2);
      const view = new DataView(buffer, 0);
      view.setInt16(0, 0);
      this.parsedCode.push(view.getUint8(0));
      this.parsedCode.push(view.getUint8(1));
      this.parsedTokenNumber += 2;
      console.log("---------PARSEDTOKENNUMBER: " + this.parsedTokenNumber + "|number of local variables: +2")
    }

    // create constant that has the startingpoint of this main-method in memory as the value. Than replace the 
    // placeholder disp after the INVOKEVIRTUAL with the offset to this constant
    let constName = "dispConstMethod" + this.methods["main"];
    let constValue: number = this.parsedTokenNumber + 1;
    this.constantOffsetToCPP[constName] = this.constNumber;
    this.constNumber += 1;
    this.constants.push(constValue);
    const buffer = new ArrayBuffer(2);
    const view = new DataView(buffer, 0);
    view.setInt16(0, this.methods["main"]);
    let valueByte1: number = view.getUint8(0);
    let valueByte2: number = view.getUint8(1);
    view.setInt16(0, this.constantOffsetToCPP[constName]);
    for(let i = 0; i < this.parsedCode.length; i++){
      if(this.parsedCode[i] === 182 && this.parsedCode[i+1] === valueByte1 && this.parsedCode[i+2] === valueByte2){
        this.parsedCode[i+1] = view.getUint8(0);
        this.parsedCode[i+2] = view.getUint8(1);
      }
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
            console.log("---------PARSEDTOKENNUMBER: " + this.parsedTokenNumber + "|instruction in control store address: +1")
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
            console.log("---------PARSEDTOKENNUMBER: " + this.parsedTokenNumber + "|const: +2*")
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
          
          // If parsed Parameter is NaN than it must be an offset or method
          // Case for method
          if(instructionToken[i-1] === "INVOKEVIRTUAL"){
            // method index
            const buffer = new ArrayBuffer(2);
            const view = new DataView(buffer, 0);
            view.setInt16(0, this.methods[instructionToken[i]]); 
            this.parsedCode.push(view.getUint8(0));
            this.parsedTokenNumber += 1;
            console.log("---------PARSEDTOKENNUMBER: " + this.parsedTokenNumber + "|methodname disp: +2*")
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
                console.log("---------PARSEDTOKENNUMBER: " + this.parsedTokenNumber + "|label offset: +2*")
                parsedParameter = view.getUint8(1);
              }
              else{
                // search where the label is in the later code and calculate offset
                let labelTokenPosition = 3;
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
                  console.log("---------PARSEDTOKENNUMBER: " + this.parsedTokenNumber + "|label offset: +2*")
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
          console.log("---------PARSEDTOKENNUMBER: " + this.parsedTokenNumber + "|at the end: +1****")
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
    let methodName: string = "";

    // finds start and end of method field
    for(let i = 0; i < this.tokens.length; i++){
      if(this.tokens[0].value.slice(0, 7) === '.method'){
        startMethodIndex = i;
        methodName = this.tokens[0].value.slice(8, this.tokens[0].value.indexOf("("));
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

      // writes the number of local variables to the memory
      const buffer = new ArrayBuffer(2);
      const view = new DataView(buffer, 0);
      view.setInt16(0, this.currentLocalVarCount);
      this.parsedCode.push(view.getUint8(0));
      this.parsedCode.push(view.getUint8(1));
      this.parsedTokenNumber += 2;
      console.log("---------PARSEDTOKENNUMBER: " + this.parsedTokenNumber + "|var count: +2")
      this.currentLocalVarCount = 0; // reverts the value back to 0, so the next invokation of setVariable() can again count the right number of local variables
    }
    else{
      const buffer = new ArrayBuffer(2);
      const view = new DataView(buffer, 0);
      view.setInt16(0, 0);
      this.parsedCode.push(view.getUint8(0));
      this.parsedCode.push(view.getUint8(1));
      this.parsedTokenNumber += 2;
      console.log("---------PARSEDTOKENNUMBER: " + this.parsedTokenNumber + "|var count: +2")
    }

    // create constant that has the startingpoint of this method in memory as the value. Than replace the 
    // placeholder disp after the INVOKEVIRTUAL with the offset to this constant
    console.log(this.parsedTokenNumber + 1 + "||||||||||||||||||||||||||||||||||||||||||||||||||||||");
    let constName = "dispConstMethod" + this.methods[methodName];
    let constValue: number = this.parsedTokenNumber + 1;
    this.constantOffsetToCPP[constName] = this.constNumber;
    this.constNumber += 1;
    this.constants.push(constValue);
    const buffer = new ArrayBuffer(2);
    const view = new DataView(buffer, 0);
    view.setInt16(0, this.methods[methodName]);
    let valueByte1: number = view.getUint8(0);
    let valueByte2: number = view.getUint8(1);
    view.setInt16(0, this.constantOffsetToCPP[constName]);
    for(let i = 0; i < this.parsedCode.length; i++){
      if(this.parsedCode[i] === 182 && this.parsedCode[i+1] === valueByte1 && this.parsedCode[i+2] === valueByte2){
        this.parsedCode[i+1] = view.getUint8(0);
        this.parsedCode[i+2] = view.getUint8(1);
      }
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
            console.log("---------PARSEDTOKENNUMBER: " + this.parsedTokenNumber + "|instruction in control store: +1")
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

        // ------------------------------------ This methodBlock method is from here on not complete ------------------------------------

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
            console.log("---------PARSEDTOKENNUMBER: " + this.parsedTokenNumber + "|constant: +2*")
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
            // method index
            const buffer = new ArrayBuffer(2);
            const view = new DataView(buffer, 0);
            view.setInt16(0, this.methods[instructionToken[i]]); 
            this.parsedCode.push(view.getUint8(0));
            this.parsedTokenNumber += 1;
            console.log("---------PARSEDTOKENNUMBER: " + this.parsedTokenNumber + "|methodname offset: +2*")
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
                console.log("---------PARSEDTOKENNUMBER: " + this.parsedTokenNumber + "|label offset: +2*")
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
                  console.log("---------PARSEDTOKENNUMBER: " + this.parsedTokenNumber + "|label offset: +2*")
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
          console.log("---------PARSEDTOKENNUMBER: " + this.parsedTokenNumber + "|am ende: +1****")
        }
      }
    }

    // methodblock is sliced out of the tokens when the block is parsed
    this.tokens.splice(startMethodIndex, endMethodIndex + 1); 
  }

  searchMethods(){
    for(let token of this.tokens){
      let methodStr = this.tokens[0].value.slice(8);

      // main-method block is identified and constant that indicatetes where this method begins is created
      if(token.type === "FIELD" && token.value === ".main"){
        this.methodNumber += 1;
        this.methods["main"] = this.methodNumber;
      }

      // other method blocks are identified and there parameters are counted.
      // it creates an identifying entry to the dictionary methods. The number in this entry is than later
      // used to place a 2 byte number in the memory after an 'INVOKEVIRTUAL'. This number is than later replaced 
      // by a offset to a constant that has the place where this method begins as the value.
      if(token.type === "FIELD" && token.value.slice(0, 7) === ".method"){
        let methodStr = token.value.slice(8);
        let methodName = methodStr.slice(0, methodStr.indexOf("("));
        let parameterStr = methodStr.slice(methodStr.indexOf("("), methodStr.indexOf(")")+1);
        let parameterCount = 0;
        
        this.methodNumber += 1;
        this.methods[methodName] = this.methodNumber;

        for(let i = 0; i < parameterStr.length; i++){
          if(parameterStr.charAt(i) === ","){
            if(parameterCount === 0){
              parameterCount += 1;
            }
            parameterCount += 1;
          }
        }
        if(parameterCount === 0 && parameterStr !== "()"){
          parameterCount = 1;
        }
        this.methodsParameterNumber[methodName] = parameterCount;
      }
    }
  }
}