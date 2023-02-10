import { Injectable } from '@angular/core';
import { MacroTokenizerService } from './macro-tokenizer.service';

@Injectable({
  providedIn: 'root'
})
export class MacroProviderService {
  private macro: string = "";

  constructor() {
    const code = localStorage.getItem("macroCode");
    if (code){
      this.macro = code;
    }
   }

  //Is called when the User presses the import button
  //and loads macro code to the interpreter
  setMacro(macro: string){
    this.macro = macro;
    localStorage.setItem("macroCode", macro);
  }

  getMacro(){
    return this.macro;
  }
}
