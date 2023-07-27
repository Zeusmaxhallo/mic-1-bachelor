import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RegProviderService } from '../../Model/reg-provider.service';

export interface BBusResult{
  register: string;
  value: number;
}

@Injectable({
  providedIn: 'root'
})

export class BBusService {
  private readonly registers: Array<string> = ["MDR", "PC", "MBR", "MBRU", "SP", "LV", "CPP", "TOS", "OPC"];
  private value: number;
  private regName: string;

  private messageSource = new BehaviorSubject([]);
  public activation = this.messageSource.asObservable();

  constructor(private regProviderService: RegProviderService) {
  }

  /**
   *
   * @param reg
   * @returns BBusResult :: {register: string, value: number}
   */
  public activate(reg: Array<number>): BBusResult {
    if (reg.length != 4) {
      throw new Error("ProtocolError - B-Bus-Operation must have 4 Bits but " + reg.length + " where given");
    }

    // Decode instruction to equivalent register
    this.regName = this.registers[parseInt(reg.join(""), 2)];

    if (this.regName !== "MBRU") {
      // get register value
      this.value = this.regProviderService.getRegister(this.regName).getValue();
    } else {
      const buffer = new ArrayBuffer(1);
      const view = new DataView(buffer, 0);

      view.setInt8(0,this.regProviderService.getRegister("MBR").getValue());

      this.value = view.getUint8(0);
    }



    // print on Console
    /**
     console.log(`B-Bus Operation: ${reg.join("")}
     |  reading from:  ${register},
     |  value:         ${this.value}
     `);
     */

    this.messageSource.next([this.regName, this.value]);
    return {register: this.regName, value: this.value}
  }

  getValue(): number {
    return this.value;
  }

  getRegName():string{
    return this.regName;
  }

}
