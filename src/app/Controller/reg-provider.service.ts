import { Injectable } from '@angular/core';
import { Register } from '../Model/Registers';

@Injectable({
  providedIn: 'root'
})
export class RegProviderService {
  private registers: Register[] = [new Register("PC", 0, 32)] 


  constructor() { }

  getRegisters():Register[]{
    return this.registers;
  }

  getRegister(name: String):Register{
    for(let register of this.registers){
      if(register.getName() === name){
        return register;
      }
    }
    return null;
  }
}

