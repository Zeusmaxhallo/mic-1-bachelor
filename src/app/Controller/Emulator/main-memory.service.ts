import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MainMemoryService {

  private memory: {[key:number]: number} = {}
  private savedItems: {[name: string]: number} = {}
  private savedItemTypes: {[name: string]: string} = {}
  private labelsDictionary: {[name: string]: number} = {}

  constructor() { }


  public store_32(address: number, value: number, name?: string, type?: string){
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer,0);

    view.setInt32(0,value);

    this.memory[address + 0] = view.getUint8(0);
    this.memory[address + 1] = view.getUint8(1);
    this.memory[address + 2] = view.getUint8(2);
    this.memory[address + 3] = view.getUint8(3);

    //Also add it to the saveItems dictionary, so that the variables, and constants can be found by name
    this.savedItems[name] = address;
    this.savedItemTypes[name] = type;
  }

  public store_8(address: number, value: number){

    if(value < 0 || value >= 256){
      throw new Error('InvalidSizeException: value must be >= 0 and must fit in a byte');
    }
    this.memory[address] = value;
  }

  public get_32(address:number):number{
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer,0);

    view.setUint8(0,this.memory[address + 0]);
    view.setUint8(1,this.memory[address + 1]);
    view.setUint8(2,this.memory[address + 2]);
    view.setUint8(3,this.memory[address + 3]);

    return view.getInt32(0);
  }

  public get_8(address:number):number{
    if(address in this.memory){
      return this.memory[address];
    }
    console.warn(`no value at address: "${address}", returning 0`);
    return 0;
  }

  public save2LocalStorage(){
    localStorage.setItem("mainMemory", JSON.stringify(this.memory));
  }

  public getFromLocalStorage(){
    this.memory = JSON.parse(localStorage.getItem("mainMemory"));
  }

  public printMemory(){
    console.log(`Address     Value  `)
    for (  const [key,value] of Object.entries(this.memory)){
      console.log(`${this.dec2hex(parseInt(key))}        0b${value.toString(2)} = ${value}`)
    }
  }

  private dec2hex(number:number){
    let prefix = "0x"
    if(number < 16){
      prefix = prefix + "0"
    }
    return prefix + number.toString(16).toUpperCase();
  }

  public getSavedItemAdress(name: string){
    return this.savedItems[name];
  }

  public getSavedItemType(name: string){
    return this.savedItemTypes[name];
  }

  public getLabelAddress(labelName: string){
    let name = labelName + ":";
    return this.labelsDictionary[name];
  }

  public setLabel(labelName: string, address: number){
    this.labelsDictionary[labelName] = address;
  }

  public addMethodToDictionary(methodName: string, address: number){
    this.savedItems[methodName] = address;
    this.savedItemTypes[methodName] = 'method';
  }

}
