import { Injectable } from '@angular/core';
import { Register } from '../Model/Registers';

@Injectable({
  providedIn: 'root'
})
export class RegProviderService {
  private registers: Register[] = [new Register("PC", 0, 32)] 


  constructor() { }

  getRegisters(){
    return this.registers;
  }

  getRegister(name: String){
    for(let register of this.registers){
      if(register.getName() === name){
        return register;
      }
    }
    return null;
  }
}

