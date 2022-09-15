import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MacroProviderService {
  private macro: string = "";

  constructor() { }

  //Is called when the User presses the export button
  setMacro(macro: string){
    this.macro = macro;    
  }

  getMacro(){
    return this.macro;
  }
}
