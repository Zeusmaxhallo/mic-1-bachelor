import { state } from '@angular/animations';
import { ParseSourceFile } from '@angular/compiler';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InterpreterService {
  statement: string = ""; //statement in one row without label
  label: string = ""; //label ob one row
  rowContent: string = ""; //complete row with label and statement
  comment: number = 0; //need for checking if comment is used in code by user
  rowNumber: number = 0; //the number of the row wich is currently used
  opcode: string = "";
  operand: string = "";

  executedRow: number = 1;

  rowContentFixed: string[] = []; //like row content but label and statement seperated
  codeFixed: string[][] = []; //Array of rowContentFixed arrays

  constantField: Boolean = false;
  mainField: Boolean = false;
  varField: Boolean = false;
  methodField: Boolean = false;

  isNotInstruction: Boolean = false;

  constructor(){}

  //seperates code to diferent rows and than invokes fixRowContent
  //after we have the fixed code the interpretation of the instructions are started
  initInterpret(content: string){
    this.resetVariables();

    content = content + "\n"; //is needed for the interpretation

    for(let i = 0; i < content.length; i++){
      if(content.charAt(i) !== "\n"){
        this.rowContent = this.rowContent + content.charAt(i);
      }
      else{
        this.rowNumber++;
        this.tokenizer(this.rowContent);
        this.rowContent = "";

        this.codeFixed[this.rowNumber] = this.rowContentFixed;
        
        this.rowContentFixed = [];
      }
    }
    for(this.executedRow; this.executedRow < this.rowNumber; this.executedRow++){
      this.runRow(this.codeFixed[this.executedRow][0], this.executedRow)
    }
    //console.log(this.codeFixed);
    
  }
  

  tokenizer(rowContent: string){
    rowContent = rowContent + "\n";
    rowContent = rowContent.replace("\t", ""); 

    //read and set label if there is one
      //after setting label the label is removed from rowContent
    for(let i = 0; i < rowContent.length; i++){
      if(rowContent.charAt(i) !== ":"){
        this.label = this.label + rowContent.charAt(i);
      }
      else{
        this.rowContentFixed[1] = this.label;
        rowContent = rowContent.substring(i+1);
        this.label = "";
        break;
      }
    }
    this.label = "";

    //removes not needed spaces in front of the instruction
    for(let i = 0; i < rowContent.length; i++){
      if(rowContent.charAt(i) !== " "){
        rowContent = rowContent.substring(i);
        break;
      }
    }


    //sets the instruction without label and comments
    for(let i = 0; i < rowContent.length; i++){
      if(this.comment < 2){
        if(rowContent.charAt(i) !== "/"){
          if(rowContent.charAt(i) !== "\n"){
            this.statement = this.statement + rowContent.charAt(i);
          }
          else{
            if(this.statement !== ""){
            }
            this.comment = 0;
          }
        }
        else{
          this.comment++;
        }
      }
      else{
        this.comment = 0;
        break;
      }
    }

    //removes not needed spaces at the end of the statement
    while(this.statement.endsWith(" ")){
      this.statement = this.statement.substring(0, this.statement.length-1);
    }

    this.rowContentFixed[0] = this.statement;
    
    if(this.rowContentFixed[1] === undefined){
      this.rowContentFixed[1] = "";
    }

    this.statement = "";
    this.label = "";
  }

  //matches identified statements that are stored in codeFixed to IJVM Instructions and uses the emulation service to call the corrosponding methods
  //also checks which field the row is in. That's how constants and var's or methods are identified.
  runRow(statement: string, rowNumber: number){
    //logs identified logs and labels with line numbers
    // console.log(rowNumber);
    // console.log("statement: " + row);
    // if(row !== undefined){
    //   console.log("label: " + row);
    // }

    //Fields and Instructions used in the MIC-1
    let tokens: string[] = [".constant", "end-constant", ".main", ".end-main", ".var", ".end-var", ".method", ".end-method", "BIPUSH", "DUP", "GOTO", "IADD", "IAND", "IFEQ", "IFLT", "IF_ICMPEQ", "IFICMPEQ", "IINC", "ILOAD", "INVOKEVIRTUAL", "IOR", "IRETURN", "ISTORE", "ISUB", "LDC_W", "LDCW", "NOP", "POP", "SWAP", "WIDE"];
    
    //The one Instruction or field that has been identified in this row
    let token: string = "";

    //if constantField is true than the next rows without an "." will be constants and are identified as such here.
    //when .end-constant come the the next rows are not expected to be constant and this if-statement is ignored
    if(this.constantField === true){
      if(statement.startsWith(".")){
        if(statement === ".end-constant"){
          this.constantField = false;
          console.log("Constant field to: false");
        }
        else{
          this.constantField = false;
          alert("Error on line: " + rowNumber + " \nYou may want to use .end-constant here.");
        }
      }
      else{
        this.createConst(statement, rowNumber);
      }
    }

    //if varField is true than the next rows without an "." will be variables and are identified as such here.
    //when .end-var comes the the next rows are not expected to be constant and this if-statement is ignored
    if(this.varField === true){
      if(statement.startsWith(".")){
        if(statement === ".end-var"){
          this.varField = false;
          console.log("Var field to: false");
        }
        else{
          this.varField = false;
          alert("Error on line: " + rowNumber + " \nYou may want to use .end-var here.");
        }
      }
      else{
        this.createVar(statement, rowNumber);
      }
    }

    //if constantField and var field are false the next row is not expected to have constants or variables.
    //thats why the token(field or instruction) is identified here
    if(this.constantField === false && this.varField === false){
      for(let i = 0; i < tokens.length; i++){
        if(statement.includes(tokens[i])){
          token = tokens[i];
        }
      }

      //The tokens that are identified are matched to mic-1 instruction or fields and the emulation service is used
      switch(token){
        case "":
          break;
        case ".constant":
          this.constantField = true;
          console.log("Constant field to: true");
          break;
        case "end-constant":
          break;
        case ".main":
          this.mainField = true;
          console.log("Main field to: true");
          break;
        case ".end-main":
          this.mainField = false;
          console.log("Main field to: false");
          break;
        case ".var":
          this.varField = true;
          console.log("Var field to: true");
          break;
        case ".end-var":
          break;
        case ".method":
          this.methodField = true;
          console.log("Method field to: true");
          break;
        case ".end-method":
          this.methodField = false;
          console.log("Method field to: false");
          break;

        case "BIPUSH":
          console.log("BIPUSH");          
          break;
        case "DUP":
          console.log("DUP");   
          break;
        case "GOTO":
          console.log("GOTO");   
          break;
        case "IADD":
          console.log("IADD");   
          break;
        case "IFEQ":
          console.log("IFEQ");   
          break;
        case "IFLT":
          console.log("IFLT");   
          break;
        case "IF_ICMPEQ":
          console.log("IF_ICMPEQ");   
          break;
        case "IFICMPEQ":
          console.log("IFICMPEQ");   
          break;
        case "IINC":
          console.log("IINC");   
          break;
        case "ILOAD":
          console.log("ILOAD");   
          break;
        case "INVOKEVIRTUAL":
          console.log("INVOKEVIRTUAL");   
          break;
        case "IOR":
          console.log("IOR");   
          break;
        case "IRETURN":
          console.log("IRETURN");   
          break;
        case "ISTORE":
          console.log("ISTORE");   
          break;
        case "ISUB":
          console.log("ISUB");   
          break;
        case "LDC_W":
          console.log("LDC_W");   
          break;
        case "LDCW":
          console.log("LDCW");   
          break;
        case "NOP":
          console.log("NOP");   
          break;
        case "POP":
          console.log("POP");   
          break;
        case "SWAP":
          console.log("SWAP");   
          break;
        case "WIDE":
          console.log("WIDE");   
          break;
        default:
          console.log("----could not understand " + token);
          ;    
      }
    }
  }

  //resets all variables
  resetVariables(){
    this.statement = "";
    this.label = "";
    this.rowContent = "";
    this.comment = 0;
    this.rowNumber = 0;
    this.executedRow = 1;
    this.rowContentFixed = [];
    this.codeFixed = [];
    this.constantField = false;
    this.mainField = false;
    this.varField = false;
    this.methodField = false;
  }

  createConst(statement: string, rowNumber: number){
    console.log("Create Constant: " + statement);    
  }

  createVar(statement: string, rowNumber: number){
    console.log("Create Variable: " + statement);    
  }
}
