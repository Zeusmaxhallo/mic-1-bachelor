import { state } from '@angular/animations';
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

  rowContentFixed: string[] = []; //like row content but label and statement seperated
  codeFixed: string[][] = []; //Array of rowContentFixed arrays

  constantField: Boolean = false;
  mainField: Boolean = false;
  varField: Boolean = false;
  methodField: Boolean = false;

  //seperates code to diferent rows and than invokes fixRowContent
  //after we have the fixed code the interpretation of the instructions are started
  initInterpret(content: string){
    this.codeFixed = [];
    this.rowNumber = 0;
    this.statement = "";

    content = content + "\n"; //is needed for the interpretation

    for(let i = 0; i < content.length; i++){
      if(content.charAt(i) !== "\n"){
        this.rowContent = this.rowContent + content.charAt(i);
      }
      else{
        this.rowNumber++;
        this.fixRowContent(this.rowContent);
        this.rowContent = "";

        this.codeFixed[this.rowNumber] = this.rowContentFixed;
        
        this.rowContentFixed = [];
      }
    }
    this.interpretCode(this.codeFixed);
  }
  

  fixRowContent(rowContent: string){
    rowContent = rowContent + "\n";
    rowContent = rowContent.replace("\t", ""); 

    for(let i = 0; i < rowContent.length; i++){
      //read and set label if there is one
      //after setting label the label is removed from rowContent
      if(rowContent.search(":")){
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

    this.statement = "";
    this.label = "";
  }

  interpretCode(code: string[][]){
    console.log(code);
    
  }
}
