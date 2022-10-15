import { Injectable } from '@angular/core';
import { MacroTokenizerService } from './macro-tokenizer.service';

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
