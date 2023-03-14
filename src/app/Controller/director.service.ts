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
import { BehaviorSubject, Subscription } from 'rxjs';
import { MacroParserService } from './macro-parser.service';
import { MacroTokenizerService } from './macro-tokenizer.service';


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
    private macroParser: MacroParserService,
    private controlStore: ControlStoreService,
    private stackProvider: StackProviderService,
    private macroTokenizer: MacroTokenizerService,

  ) { }

  private currentAddress = 1;
  private lineNumber = 0;

  private MBRMemoryQueue: Array<number> = [];
  private MDRMemoryQueue: Array<number> = [];

  private _isReady = new BehaviorSubject<boolean>(true);
  private isReady = this._isReady.asObservable();
  private sub: Subscription = new Subscription();

  public isRunning = false;
  public endOfProgram = true;

  public animationSpeed = 2;
  public animationEnabled = true;

  // Observables to notify the animation components 
  private startAnimationSource = new BehaviorSubject([]);
  public startAnimation = this.startAnimationSource.asObservable();

  private setRegisterValuesSource = new BehaviorSubject([]);
  public setRegisterValues = this.setRegisterValuesSource.asObservable();

  private _finishedRun = new BehaviorSubject<boolean>(false);
  public finishedRun = this._finishedRun.asObservable();

  private _errorFlasher = new BehaviorSubject({line:0, error: ""});
  public errorFlasher$ = this._errorFlasher.asObservable();




  /** Setup the Director*/
  public init() {
    this.controlStore.loadMicro();
    for (const register of this.regProvider.getRegisters()) {
      this.showRegisterValue(register.getName(), register.getValue())
    }
    this.endOfProgram = false;
  }

  /** Run until macro-program is finished */
  public run() {
    this.isRunning = true;
    this.init();

    this.sub = this.isReady.subscribe(
      val => {

        // check if run was stopped from extern
        if (!this.isRunning) {
          this.sub.unsubscribe()
          return;
        }

        if (!this.endOfProgram) {
          this.step();
        } else {
          this.sub.unsubscribe()
          this.isRunning = false;
        }
      })
  }

  /** director has to be initialized first -> .init() */
  public runMacroInstruction() {

    // remember if animation was enabled
    const animationEnableStatus = this.animationEnabled;
    this.animationEnabled = false

    this.isRunning = true;
    this.step();

    this.sub = this.isReady.subscribe(
      val => {
        // check if run was stopped from extern
        if (!this.isRunning) {
          this.sub.unsubscribe()
          this.animationEnabled = animationEnableStatus;
          return;
        }

        // main-instruction (address: 1) gets executed after every instruction
        // if we reached main the macro-instruction is finished
        if (this.currentAddress === 1 || this.endOfProgram){
          this.sub.unsubscribe()
          this.isRunning = false;
          this.animationEnabled = animationEnableStatus;
        }else{
          this.step();
        }
      })


  }

  public step() {
    
    // check if Program is finished
    if (this.mainMemory.finished && (this.currentAddress === 1 || this.currentAddress === 0)){
      this.endOfProgram = true;
      this._finishedRun.next(false);
      this.isRunning = false;
      this._isReady.next(false);
      return;
    }

    console.log("Executing Instruction at Address: " + this.currentAddress);
    let line = this.controlStore.getMicro()[this.currentAddress]
    let tokens = line.tokens;
    this.lineNumber = line.lineNumber;
    console.log("Line: " + this.lineNumber);
    if (!tokens) {
      throw new Error(`No Instruction at Address ${this.currentAddress}`);
    }

    // set MBR
    if (this.MBRMemoryQueue[0]) {
      let addr = this.MBRMemoryQueue.shift();
      let MBR = this.regProvider.getRegister("MBR");
      MBR.setValue(this.mainMemory.get_8(addr));
      this.showRegisterValue(MBR.getName(), MBR.getValue(), this.animationEnabled);
    } else { this.MBRMemoryQueue.shift(); }


    //set MDR
    if (this.MDRMemoryQueue[0]) {
      let addr = this.MDRMemoryQueue.shift();
      let MDR = this.regProvider.getRegister("MDR");
      MDR.setValue(this.mainMemory.get_32(addr));
      this.showRegisterValue(MDR.getName(), MDR.getValue(), this.animationEnabled);
    } else { this.MDRMemoryQueue.shift(); }



    // parse instruction
    this.parser.init(tokens, this.currentAddress);
    let microInstruction: Instruction
    try {
       microInstruction = this.parser.parse();
    } catch (error) {
      if (error instanceof Error){
        console.error("Error in line " + this.lineNumber+ " - " + error);
        this._errorFlasher.next({line: this.lineNumber, error: error.message});
      }
      return;
    }
    

    // calculate
    let bBusResult = this.bBus.activate(microInstruction.b);
    let [aluResult, aBusResult] = this.alu.calc(microInstruction.alu.slice(2));
    let shifterResult = this.shifter.shift(microInstruction.alu.slice(0, 2), aluResult);
    let cBusResult = this.cBus.activate(microInstruction.c, shifterResult);

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
      try {
        this.mainMemory.store_32(addr, this.regProvider.getRegister("MDR").getValue());
        this.mainMemory.save2LocalStorage();
      } catch (error) {
        if (error instanceof Error){
          console.error("Error in line " + this.lineNumber+ " - " + error);
          this._errorFlasher.next({line: this.lineNumber, error: error.message});
        }
        return;
      }
      
    }

    this.stackProvider.update(); // update Stack after each step

    // set next address
    this.currentAddress = parseInt(microInstruction.addr.join(""), 2)

    // check if we have to jump
    if ( microInstruction.jam[2] && aluResult === 0){
      this.currentAddress += 256;
    }
    if (microInstruction.jam[1] && aluResult <= 0){
      this.currentAddress += 256;
    }

    // start animation
    this.animate(bBusResult, aluResult, shifterResult, cBusResult, aBusResult);

  }

  private async animate(bBusResult: BBusResult, aluResult: number, shifterResult: number, cBusResult: CBusResult, aBusResult: number) {

    if (this.animationEnabled) {

      // Tell Mic-Visualization to start a animation via this Observable
      this.startAnimationSource.next([bBusResult, aluResult, shifterResult, cBusResult, aBusResult]);
    } else {


      let delay = function (ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
      }
      await delay(10);

      this._isReady.next(true);
    }
  }

  private showRegisterValue(register: string, value: number, activateMemoryArrow?: boolean) {
    this.setRegisterValuesSource.next([register, value, activateMemoryArrow == undefined ? false : activateMemoryArrow]);
  }


  public set animationComplete(v: boolean) {
    console.log("animations Complete");
    if (v) { this._isReady.next(true) }
  }


  public reset() {
    this.isRunning = false;
    this.currentAddress = 1;

    // reset all registers
    let registers = this.regProvider.getRegisters();
    for (let register of registers) {
      register.setValue(0);
    }

    // reset Queues
    this.MBRMemoryQueue = [];
    this.MDRMemoryQueue = [];

    // reset memory
    this.controlStore.loadMicro();
    this.macroTokenizer.init();
    this.macroParser.parse();

    // animate new register Values
    for (let register of registers) {
      this.showRegisterValue(register.getName(), register.getValue());
    }

    //reset program
    this.endOfProgram = false;
    this.mainMemory.finished = false;

    // reset stack View
    this.stackProvider.update()
    
    //enable buttons
    this._finishedRun.next(true);

  }
}
