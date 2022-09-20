import { Injectable } from '@angular/core';
import { InterpreterService } from './interpreter.service';

@Injectable({
  providedIn: 'root'
})

//has all the implementation for the IJVM Instructions by using the microprograms.
//fields are checked in the interpreter service
//pass everything that is needed from the interpreter service over here.
export class EmulationService {

  constructor() { }

  bipushInstruction(statement: string){
    console.log("BIPUSH");
  }

  dupInstruction(statement: string){
    console.log("DUP");
  }

  gotoInstruction(statement: string){
    console.log("GOTO");
  }

  iaddInstruction(statement: string){
    console.log("IADD");
  }

  iandInstruction(statement: string){
    console.log("IAND");
  }

  ifeqInstruction(statement: string){
    console.log("IFEQ");
  }

  ifltInstruction(statement: string){
    console.log("IFLT");
  }

  ificmpeqInstruction(statement: string){
    console.log("IFICMPEQ");
  }

  iincInstruction(statement: string){
    console.log("IINC");
  }

  iloadInstruction(statement: string){
    console.log("ILOAD");
  }

  invokevirtualInstruction(statement: string){
    console.log("INVOKEVIRTUAL");
  }

  iorInstruction(statement: string){
    console.log("IOR");
  }

  ireturnInstruction(statement: string){
    console.log("IRETURN");
  }

  istoreInstruction(statement: string){
    console.log("ISTORE");
  }

  isubInstruction(statement: string){
    console.log("ISUB");
  }

  ldcwInstruction(statement: string){
    console.log("LDCW");
  }

  nopInstruction(statement: string){
    console.log("NOP");
  }

  popInstruction(statement: string){
    console.log("POP");
  }

  swapInstruction(statement: string){
    console.log("SWAP");
  }

  wideInstruction(statement: string){
    console.log("WIDE");
  }


  createConst(statement: string, rowNumber: number){
    console.log("Create constant: " + statement);
  }

  createVar(statement: string, rowNumber: number){
    console.log("Create variable: " + statement);
  }
}
