import { Injectable } from '@angular/core';
import { RegProviderService } from '../reg-provider.service';
import { BehaviorSubject } from 'rxjs';

const CURSOR_ADDRESS = 65536;


@Injectable({
  providedIn: 'root'
})
export class MainMemoryService {

  private memory: { [key: number]: number } = {}

  public methodAreaSize: number;
  public constantPoolSize: number;

  private _stackStartAddress = 0;

  private _updateMemoryView = new BehaviorSubject({address: 0, value: 0});
  public updateMemoryView$ = this._updateMemoryView.asObservable();

  constructor(
    private regProvider: RegProviderService,
  ) { }

  public get stackStartAddress(): number {
    return this._stackStartAddress;
  }

  public emptyMemory(){
    this.memory = {}
    this.methodAreaSize = 0;
    this.constantPoolSize = 0;
    this._stackStartAddress = 0;
  }

  public store_32(address: number, value: number, setter?: boolean) {

    //check if we have permission to write in this area
    if (!setter && (address < this.methodAreaSize + this.constantPoolSize)) {
      throw new Error("Segmentation fault - The area you are trying to write is read only");
    }

    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer, 0);

    view.setInt32(0, value);

    this.memory[address + 0] = view.getUint8(0);
    this.memory[address + 1] = view.getUint8(1);
    this.memory[address + 2] = view.getUint8(2);
    this.memory[address + 3] = view.getUint8(3);

    this._updateMemoryView.next({address: address, value: value})
  }

  private store_8(address: number, value: number) {

    // if (value < -128 || value >= 128) {
    //   throw new Error('InvalidSizeException: value must be >= 0 and must fit in a byte. Your value: ' + value);
    // }
    this.memory[address] = value;
  }

  public get_32(address: number): number {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer, 0);

    view.setUint8(0, this.memory[address + 0]);
    view.setUint8(1, this.memory[address + 1]);
    view.setUint8(2, this.memory[address + 2]);
    view.setUint8(3, this.memory[address + 3]);

    return view.getInt32(0);
  }

  public get_8(address: number, intern?: boolean): number {
    if (address >= this.methodAreaSize) {
      console.warn("PC reading outside of Method Area (PC is not pointing to Code), current PC value: ", address);
    }
    if (address in this.memory) {
      return this.memory[address];
    }
    if (!intern) {
      console.warn(`no value at address: "${address}", returning 0`);
    }
    return 0;
  }

  public printMemory() {
    this.printCodeArea();
    this.printConstantArea();
    this.printStack();
  }

  private printCodeArea() {
    console.group('%cMethodArea', 'color: green');
    console.log(`  Address     Value  `)
    for (let i = 0; i < this.methodAreaSize; i++) {
      console.log(`  ${this.dec2hex(i)}        0b${this.get_8(i, true).toString(2)} = ${this.get_8(i, true)}`)
    }
    console.groupEnd();
  }

  private printConstantArea() {
    console.group('%cConstantPool', 'color: blue');
    console.log(`  Address     Value  `)

    const start = this.regProvider.getRegister("CPP").getValue() * 4;
    for (let i = start; i < start + this.constantPoolSize; i += 4) {
      console.log(`  ${this.dec2hex(i)}        0b${this.get_32(i).toString(2)} = ${this.get_32(i)}`)
    }

    console.groupEnd();
  }

  private printStack() {
    console.group('%cGeneral Memory', 'color: brown');
    console.log(`  Address     Value  `)

    let start = this.regProvider.getRegister("CPP").getValue() * 4 + this.constantPoolSize;
    let keys = Object.keys(this.memory).filter(address => parseInt(address) >= start).sort();

    for (let i = 0; i < keys.length; i += 4) {
      console.log(`  ${this.dec2hex(parseInt(keys[i]))}        0b${this.get_32(parseInt(keys[i])).toString(2)} = ${this.get_32(parseInt(keys[i]))}`)
    }

    console.groupEnd();
  }


  public dec2hex(number: number) {
    let prefix = "0x"
    if (number < 16) {
      prefix = prefix + "0"
    }
    return prefix + number.toString(16).toUpperCase();
  }

  public setCode(code: number[]) {
    this.methodAreaSize = code.length; // align next Memory Addresses

    this.regProvider.getRegister("MBR").setValue(code[0]); // Initialize MBR with first instruction

    for (let i = 0; i < code.length; i++) {
      this.store_8(i, code[i]);
    }
  }

  /**
   * !!! Before setConstants() must come setCode() !!!
   */
  public setConstants(constants: number[]) {
    this.constantPoolSize = constants.length * 4;
    let alignedMethodAreaSize = Math.ceil(this.methodAreaSize / 4) * 4;

    this.regProvider.getRegister("CPP").setValue(alignedMethodAreaSize / 4); // set CPP to first constant
    for (let i = 0; i < constants.length; i++) {
      this.store_32(alignedMethodAreaSize + i * 4, constants[i], true); // constants start after the MethodArea
    }
    this._stackStartAddress = alignedMethodAreaSize + this.constantPoolSize;

    // Set SP and LV to start of Stack
    this.regProvider.getRegister("SP").setValue(this._stackStartAddress / 4);
    this.regProvider.getRegister("LV").setValue(this._stackStartAddress / 4);

    // init cursor Position
    this.store_32(CURSOR_ADDRESS * 4, 0);

  }

  public createVariables(amount: number) {
    let start = (this.regProvider.getRegister("LV").getValue()) * 4;
    for (let i = 0; i < amount; i++) {
      this.store_32(start + i * 4, 0);
    }
    this.regProvider.getRegister("SP").setValue(this.regProvider.getRegister("SP").getValue() + amount);
  }

  public getMemory(){
    return this.memory;
  }


}
