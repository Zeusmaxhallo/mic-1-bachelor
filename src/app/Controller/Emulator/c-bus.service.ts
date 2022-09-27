import { Injectable } from '@angular/core';
import { Register } from 'src/app/Model/Registers';
import { RegProviderService } from '../reg-provider.service';

@Injectable({
  providedIn: 'root'
})

export class CBusService {
  private regs: Register[];

  constructor() {}

  addReg(reg: Register){
    this.regs.push(reg);
  }

  writeValue(value: number){
    for (let i = 0; i < this.regs.length; i++) {
      this.regs[i].setValue(value);
    }
  }
}
