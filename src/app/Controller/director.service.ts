import { Injectable } from '@angular/core';
import { AluService } from './Emulator/alu.service';
import { BBusService } from './Emulator/b-bus.service';
import { CBusService } from './Emulator/c-bus.service';
import { ControlStoreService } from './Emulator/control-store.service';
import { Instruction, ParserService } from './Emulator/parser.service';
import { ShifterService } from './Emulator/shifter.service';
import { MicroProviderService } from './micro-provider.service';

@Injectable({
  providedIn: 'root'
})
export class DirectorService {

  constructor(
    private parser: ParserService,
    private alu: AluService,
    private bBus: BBusService,
    private cBus: CBusService,
    private shifter: ShifterService,
    private controlStore: ControlStoreService,
    ) { }

  private currentAddress = 16;

  public step(){

    console.log("Executing Instruction at Address: " + this.currentAddress);
    let tokens = this.controlStore.getMicro()[this.currentAddress];
    if(!tokens){
      throw new Error(`No Instruction at Address ${this.currentAddress}`); 
    }
    
    this.parser.init(tokens,this.currentAddress);
    let microInstruction = this.parser.parse();

    
    this.bBus.activate(microInstruction.b);
    let result = this.alu.calc(microInstruction.alu.slice(2));
    result = this.shifter.shift(microInstruction.alu.slice(0,2), result)
    this.cBus.activate(microInstruction.c,result);

    this.currentAddress = parseInt(microInstruction.addr.join(""),2)
  }
}
