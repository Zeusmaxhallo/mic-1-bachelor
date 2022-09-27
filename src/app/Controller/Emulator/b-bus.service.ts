import { Inject, Injectable } from '@angular/core';
import { RegProviderService } from '../reg-provider.service';

@Injectable({
  providedIn: 'root'
})

export class BBusService {
  private readonly registers: Array<string> = ["MDR", "PC", "MBR", "MBRU", "SP", "LV", "CPPP", "TOS", "OPC"];
  private value: number;

  constructor(private regProviderService: RegProviderService) {
   }

  public activate(reg: Array<number>): void{
    if(reg.length != 4){
      throw new Error("ProtocolError - B-Bus-Operation must have 4 Bits but " + reg.length + " where given");
    }
    
    // Decode instruction to equivalent register
    let register: number = parseInt(reg.join(""), 2) 
    
    // get register value
    this.value = this.regProviderService.getRegister(this.registers[register]).getValue(); 

    // print on Console
    console.log(`B-Bus Operation: ${reg.join("")}
    |  reading from:  ${this.registers[register]},
    |  value:         ${this.value}
    `);
  }

  getValue(): number{
    return this.value;
  }  

}
