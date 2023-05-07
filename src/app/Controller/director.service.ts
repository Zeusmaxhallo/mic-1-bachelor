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
import { MacroProviderService } from './macro-provider.service';


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
  private currentMacroAddr = 0;

  private MBRMemoryQueue: Array<number> = [];
  private MDRMemoryQueue: Array<number> = [];

  private _isReady = new BehaviorSubject<boolean>(true);
  private isReady = this._isReady.asObservable();
  private sub: Subscription = new Subscription();

  public isRunning = false;
  public endOfProgram = true;

  public animationSpeed = 2;
  public animationEnabled = true;

  private microBreakpoints: Array<number> = [];
  private macroBreakpoints: Array<number> = [];
  private macroBreakpointsAddr: Array<number> = [];
  private hitBreakpoint = false;

  // Observables to notify other components 
  private startAnimationSource = new BehaviorSubject([]);
  public startAnimation = this.startAnimationSource.asObservable();

  private setRegisterValuesSource = new BehaviorSubject([]);
  public setRegisterValues = this.setRegisterValuesSource.asObservable();

  private _finishedRun = new BehaviorSubject<boolean>(false);
  public finishedRun = this._finishedRun.asObservable();

  private _errorFlasher = new BehaviorSubject({ line: 0, error: "" });
  public errorFlasher$ = this._errorFlasher.asObservable();

  private _breakpointFlasher = new BehaviorSubject({ line: 0 });
  public breakpointFlasher$ = this._breakpointFlasher.asObservable();

  private _breakpointFlasherMacro = new BehaviorSubject({ line: 0 });
  public breakpointFlasherMacro$ = this._breakpointFlasherMacro.asObservable();

  private _consoleNotifier = new BehaviorSubject("");
  public consoleNotifier$ = this._consoleNotifier.asObservable();




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
    if (this.hitBreakpoint) {
      this.isRunning = false;
      this.hitBreakpoint = false;
      return;
    }

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
        if (this.currentAddress === 1 || this.endOfProgram) {
          this.sub.unsubscribe()
          this.isRunning = false;
          this.animationEnabled = animationEnableStatus;
        } else {
          this.step();
          if (this.hitBreakpoint) {
            this.sub.unsubscribe();
            this.isRunning = false;
            this.animationEnabled = animationEnableStatus
            this.hitBreakpoint = false;
          }
        }
      }
    )

  }

  public step() {

    // check if program is finished
    if (this.mainMemory.finished && (this.currentAddress === 1 || this.currentAddress === 0)) {
      this.endOfProgram = true;
      this._finishedRun.next(false);
      this.isRunning = false;
      this._isReady.next(false);
      this._consoleNotifier.next("Program terminated successfully!")
      return
    }

    let line = this.controlStore.getMicro()[this.currentAddress]
    let tokens;
    this.lineNumber = line.lineNumber;
    console.log("Executing Instruction at Address: " + this.currentAddress + " line: " + this.lineNumber);

    // throw Error when there are no Tokens in current line
    try {
      tokens = line.tokens;
    } catch (error) {
      console.error("Error in line " + this.lineNumber + " - " + error);
      this._errorFlasher.next({ line: this.lineNumber, error: "Invalid Instruction" });
      this.isRunning=false;
      return
    }
    if (!tokens) {
      throw new Error(`No Instruction at Address ${this.currentAddress}`);
    }

    // check if we hit a Breakpoint in the micro-code
    if (this.microBreakpoints.includes(this.lineNumber)) {
      console.log("%cHit Breakpoint in the micro-code in line " + this.lineNumber, "color: #248c46");
      this.hitBreakpoint = true;
      this._breakpointFlasher.next({ line: this.lineNumber });
    }

    // check if we hit a Breakpoint in the macro-code
    console.log("Currenty read macro Address in main-memory: " + this.currentMacroAddr)
    console.log(this.currentMacroAddr)
    console.table(this.macroBreakpointsAddr)
    if(this.macroBreakpointsAddr.includes(this.currentMacroAddr)){
      console.log("%cHit Breakpoint in the memory address: " + (this.currentMacroAddr), "color: #248c46");
      this.hitBreakpoint = true;
      this._breakpointFlasherMacro.next({ line: this.macroParser.getLineOfAddress(this.currentMacroAddr)});
    }

    console.table(this.macroBreakpoints)

    // set MBR
    if (this.MBRMemoryQueue[0]) {
      let addr = this.MBRMemoryQueue.shift();
      let MBR = this.regProvider.getRegister("MBR");
      
      if(this.macroParser.getOffsetOnAddress(this.currentMacroAddr) !== undefined){
        let offset = this.macroParser.getOffsetOnAddress(this.currentMacroAddr)-1;
        this.currentMacroAddr = offset;
        console.log("%cHit Jump-Instruction offset. Jump to memory address: " + (this.currentMacroAddr+1), "color: #248c46");
      }
      this.currentMacroAddr += 1;

      if (this.hitBreakpoint) {
        this.sub.unsubscribe();
        this.isRunning = false;
        this.hitBreakpoint = false;
        this._finishedRun.next(true);
      }

      MBR.setValue(this.mainMemory.get_8(addr));
      this.showRegisterValue(MBR.getName(), MBR.getValue(), this.animationEnabled);
    } else { 
      this.MBRMemoryQueue.shift(); 
    }


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
      if (error instanceof Error) {
        console.error("Error in line " + this.lineNumber + " - " + error);
        this._errorFlasher.next({ line: this.lineNumber, error: error.message });
        this.isRunning = false;
      }
      return
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
        if (error instanceof Error) {
          console.error("Error in line " + this.lineNumber + " - " + error);
          this._errorFlasher.next({ line: this.lineNumber, error: error.message });
          this.isRunning = false;
        }
        return
      }

    }

    this.stackProvider.update(); // update Stack after each step

    // set next address
    this.currentAddress = parseInt(microInstruction.addr.join(""), 2)

    // check if we have to jump
    if (microInstruction.jam[2] && aluResult === 0) {
      this.currentAddress += 256;
    }
    if (microInstruction.jam[1] && aluResult <= 0) {
      this.currentAddress += 256;
    }

    // start animation
    this.animate(bBusResult, aluResult, shifterResult, cBusResult, aBusResult);

    return

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
    this.currentMacroAddr = 0;

    // reset all registers
    let registers = this.regProvider.getRegisters();
    for (let register of registers) {
      register.setValue(0);
    }

    // reset Queues
    this.MBRMemoryQueue = [];
    this.MDRMemoryQueue = [];

    // reset memory
    try {
      this.controlStore.loadMicro();
      this.macroTokenizer.init();
      this.macroParser.parse();
    } catch (error) {
      if (error instanceof Error) {
        this._errorFlasher.next({line: 1, error:error.message});
      }
      
    }


 

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

    // set Breakpoints Addresses for Macrocode
    for(let i = 0; i < this.macroBreakpoints.length; i++){
      this.macroBreakpointsAddr[i] = this.macroParser.getAddressOfLine(this.macroBreakpoints[i]);
    }

    // notify console that reset was successful
    this._consoleNotifier.next("Macrocode loaded successfully!");

  }


  public setMicroBreakpoint(breakpoint: number) {
    if (this.microBreakpoints.includes(breakpoint)) { return; }
    this.microBreakpoints.push(breakpoint);
  }

  public clearMicroBreakpoint(breakpoint: number) {
    const index = this.microBreakpoints.indexOf(breakpoint)
    if (index > -1) {
      this.microBreakpoints.splice(index, 1);
    }
  }

  public clearMicroBreakpoints() {
    this.microBreakpoints = [];
  }

  public setMacroBreakpoint(breakpoint: number){
    if(this.macroBreakpoints.includes(breakpoint)){return;}
    this.macroBreakpoints.push(breakpoint);
  }

  public clearMacroBreakpoint(breakpoint: number){
    const index = this.macroBreakpoints.indexOf(breakpoint)
    if(index > -1) {
      this.macroBreakpoints.splice(index, 1);
    }
  }

  public clearMacroBreakpoints(){
    this.macroBreakpoints = [];
  }
}
