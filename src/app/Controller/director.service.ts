import { Injectable } from '@angular/core';
import { AluService } from './Emulator/alu.service';
import { BBusService, BBusResult } from './Emulator/b-bus.service';
import { CBusService, CBusResult } from './Emulator/c-bus.service';
import { ControlStoreService } from './Emulator/control-store.service';
import { MainMemoryService } from './Emulator/main-memory.service';
import { Instruction, ParserService } from './Emulator/parser.service';
import { ShifterService } from './Emulator/shifter.service';
import { RegProviderService } from './reg-provider.service';
import { StackProviderService } from './stack-provider.service';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DirectorService {

  constructor(
    
    private alu: AluService,
    private cBus: CBusService,
    private bBus: BBusService,
    private parser: ParserService,
    private shifter: ShifterService,
    private mainMemory: MainMemoryService,
    private regProvider: RegProviderService,
    private controlStore: ControlStoreService,
    private stackProvider: StackProviderService,
  ) { }

  private currentAddress = 1;

  private MBRMemoryQueue: Array<number> = [];
  private MDRMemoryQueue: Array<number> = [];

  private _animationComplete = true;

  // Observables to notify the animation components 
  private startAnimationSource = new BehaviorSubject([]);
  public startAnimation = this.startAnimationSource.asObservable();

  private setRegisterValuesSource = new BehaviorSubject([]);
  public setRegisterValues = this.setRegisterValuesSource.asObservable();


  
  /** Setup the Director*/
  public init(){
    this.controlStore.loadMicro();
    for (const register of this.regProvider.getRegisters()){
      this.showRegisterValue(register.getName(), register.getValue())
    }

  }

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
      this.showRegisterValue(MBR.getName(), MBR.getValue(), true);
    } else { this.MBRMemoryQueue.shift(); }


    //set MDR
    if (this.MDRMemoryQueue[0]) {
      let addr = this.MDRMemoryQueue.shift();
      let MDR = this.regProvider.getRegister("MDR");
      MDR.setValue(this.mainMemory.get_32(addr));
      this.showRegisterValue(MDR.getName(), MDR.getValue(), true);
      console.log("MDR holt moped")
    } else { this.MDRMemoryQueue.shift(); }



    // parse instruction
    this.parser.init(tokens, this.currentAddress);
    let microInstruction = this.parser.parse();

    // calculate
    let bBusResult = this.bBus.activate(microInstruction.b);
    let [aluResult, aBusResult] = this.alu.calc(microInstruction.alu.slice(2));
    let shifterResult = this.shifter.shift(microInstruction.alu.slice(0, 2), aluResult)
    let cBusResult = this.cBus.activate(microInstruction.c, shifterResult);

    // start animation
    this.animate(bBusResult, aluResult, shifterResult, cBusResult, aBusResult);


    // memory instructions:
    // fetch
    if (microInstruction.mem[2]) {
      if (!this.MBRMemoryQueue[0]) { this.MBRMemoryQueue.push(0); }
      this.MBRMemoryQueue.push(this.regProvider.getRegister("PC").getValue());
    }
    // read
    if (microInstruction.mem[1]) {
      if (!this.MDRMemoryQueue[0]) { this.MDRMemoryQueue.push(0); }
      // MDR reads 32Bit Words -> multiply address in MAR with 4
      this.MDRMemoryQueue.push(this.regProvider.getRegister("MAR").getValue() * 4);
    }
    //write
    if (microInstruction.mem[0]) {
      let addr = this.regProvider.getRegister("MAR").getValue() * 4;
      this.mainMemory.store_32(addr, this.regProvider.getRegister("MDR").getValue());
      this.mainMemory.save2LocalStorage();
    }

    this.stackProvider.update(); // update Stack after each step

    // set next address
    this.currentAddress = parseInt(microInstruction.addr.join(""), 2)
  }

  private animate(bBusResult: BBusResult, aluResult: number, shifterResult: number, cBusResult: CBusResult, aBusResult: number) {

    this._animationComplete = false;

    // Tell Mic-Visualization to start a animation via this Observable
    this.startAnimationSource.next([bBusResult, aluResult, shifterResult, cBusResult, aBusResult]);
  }

  private showRegisterValue( register: string, value: number, activateMemoryArrow?: boolean ){
    this.setRegisterValuesSource.next([register, value, activateMemoryArrow == undefined ? false: activateMemoryArrow]);
  }


  public set animationComplete(v: boolean) {
    this._animationComplete = v;
    console.log("animations Complete");
  }


}
