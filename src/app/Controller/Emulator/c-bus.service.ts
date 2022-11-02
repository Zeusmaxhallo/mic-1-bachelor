import { Injectable } from '@angular/core';
import { RegProviderService } from '../reg-provider.service';
import { StackProviderService } from '../stack-provider.service';

@Injectable({
  providedIn: 'root'
})

export class CBusService {

  private _writtenRegisters: string[] = [];

  public get writtenRegisters(): string[]{
    return this._writtenRegisters;
  }
  
  // all Register that can be written by the C-Bus (ordered according to Tannenbaum)
  private readonly registers: string[] = [
    "H",
    "OPC",
    "TOS",
    "CPP",
    "LV",
    "SP",
    "PC",
    "MDR",
    "MAR",
  ]

  constructor(private regProvider: RegProviderService, private stackProvider: StackProviderService ) {}

  public activate(operation: number[], value: number ): void{
    if (operation.length != 9) {
      throw new Error("ProtocolError - C-Bus-Operation must have 9 Bits but " + operation.length + " were given");
    }

    // reset written registers
    this._writtenRegisters = [];

    // if a Register is selected -> write the given value
    for(let i = 0; i < operation.length; i++){
      if (operation[i]) {
        this.regProvider.getRegister(this.registers[i]).setValue(value);
        this._writtenRegisters.push(this.registers[i]);

        if(this.registers[i] === "SP"){
          this.stackProvider.sp = value;
        }
        if(this.registers[i] === "LV"){
          this.stackProvider.lv = value;
        }
      }
    }

    // Print to Console
    console.log(`C-Bus Operation: ${operation.join("")}
    |  write value:   ${value},
    |  to Registers:  ${this._writtenRegisters}
    `);
  }
}
