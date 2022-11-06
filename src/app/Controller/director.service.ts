import { Injectable } from '@angular/core';
import { AluService } from './Emulator/alu.service';
import { BBusService } from './Emulator/b-bus.service';
import { CBusService } from './Emulator/c-bus.service';
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
    private microProvider: MicroProviderService,
    ) { }

  private controlStore: {[address: number]: Instruction};
  private currentAddress = 16;

  public loadMicro(){
    this.parser.labels = {};
    this.controlStore = this.parser.compile(this.microProvider.getMicro().split("\n"));
  }

  public step(){

    let microInstruction = this.controlStore[this.currentAddress];
    
    this.bBus.activate(microInstruction.b);
    let result = this.alu.calc(microInstruction.alu.slice(2));
    result = this.shifter.shift(microInstruction.alu.slice(0,2), result)
    this.cBus.activate(microInstruction.c,result);


    this.currentAddress = parseInt(microInstruction.addr.join(""),2)
    console.log("next address = " + this.currentAddress);

  }
}
