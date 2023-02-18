import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MacroProviderService {
  private macro: string = "";

  macroGotChanged: boolean = false;

  constructor() {
    const code = localStorage.getItem("macroCode");
    if (code){
      this.macro = code;
    }
  }

  setMacro(macro: string){
    this.macroGotChanged = true;
    this.macro = macro;
    localStorage.setItem("macroCode", macro);
  }

  getMacro(){
    return this.macro;
  }

  isLoaded(){
    this.macroGotChanged = false;
  }

  getMacroGotChanged(){
    return this.macroGotChanged;
  }
}
