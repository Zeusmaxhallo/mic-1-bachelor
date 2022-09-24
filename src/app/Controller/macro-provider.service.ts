import { Injectable } from '@angular/core';
import { InterpreterService } from './interpreter.service';

@Injectable({
  providedIn: 'root'
})
export class MacroProviderService {
  private macro: string = "";

  constructor() { }

  //Is called when the User presses the import button
  //and loads macro code to the interpreter
  setMacro(macro: string){
    this.macro = macro; 
  }

  getMacro(){
    return this.macro;
  }
}
