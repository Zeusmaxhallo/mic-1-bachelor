import { Injectable } from '@angular/core';
import { AluService } from './Emulator/alu.service';
import { BBusService } from './Emulator/b-bus.service';
import { CBusService } from './Emulator/c-bus.service';
import { ControlStoreService } from './Emulator/control-store.service';
import { MainMemoryService } from './Emulator/main-memory.service';
import { Instruction, ParserService } from './Emulator/parser.service';
import { ShifterService } from './Emulator/shifter.service';
import { RegProviderService } from './reg-provider.service';


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
    private mainMemory: MainMemoryService,
    private regProvider: RegProviderService,
  ) { }

  private currentAddress = 16;

  private MBRMemoryQueue: Array<number> = [];
  private MDRMemoryQueue: Array<number> = [];

  public step() {
    console.log("Executing Instruction at Address: " + this.currentAddress);
    let tokens = this.controlStore.getMicro()[this.currentAddress];
    if (!tokens) {
      throw new Error(`No Instruction at Address ${this.currentAddress}`);
    }

    // set MBR
    if (this.MBRMemoryQueue[0]) {
      let addr = this.MBRMemoryQueue.shift();
      let MBR = this.regProvider.getRegister("MBR");
      MBR.setValue(this.mainMemory.get_8(addr));
    } else { this.MBRMemoryQueue.shift(); }


    //set MDR
    if (this.MDRMemoryQueue[0]) {
      let addr = this.MDRMemoryQueue.shift();
      let MDR = this.regProvider.getRegister("MDR");
      MDR.setValue(this.mainMemory.get_32(addr))
    } else { this.MDRMemoryQueue.shift(); }



    // parse instruction
    this.parser.init(tokens, this.currentAddress);
    let microInstruction = this.parser.parse();

    // calculate
    this.bBus.activate(microInstruction.b);
    let result = this.alu.calc(microInstruction.alu.slice(2));
    result = this.shifter.shift(microInstruction.alu.slice(0, 2), result)
    this.cBus.activate(microInstruction.c, result);

    // memory instructions:
    // fetch
    if (microInstruction.mem[2]) {
      if (!this.MBRMemoryQueue[0]) { this.MBRMemoryQueue.push(0); }
      this.MBRMemoryQueue.push(0, this.regProvider.getRegister("PC").getValue());
    }
    // read
    if (microInstruction.mem[1]) {
      if (!this.MDRMemoryQueue[0]) { this.MDRMemoryQueue.push(0); }
      // MDR reads 32Bit Words -> multiply address in MAR * 4
      this.MDRMemoryQueue.push(this.regProvider.getRegister("MAR").getValue() * 4);
    }
    //write
    if (microInstruction.mem[0]) {
      let addr = this.regProvider.getRegister("MAR").getValue() * 4;
      this.mainMemory.store_32(addr, this.regProvider.getRegister("MDR").getValue());
      this.mainMemory.save2LocalStorage();
    }



    // set next address
    this.currentAddress = parseInt(microInstruction.addr.join(""), 2)
  }

}
