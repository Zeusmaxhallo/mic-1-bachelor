import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MacroProviderService } from '../Model/macro-provider.service';
import { MainMemoryService } from '../Model/Emulator/main-memory.service';
import { RegProviderService } from '../Model/reg-provider.service';

@Injectable({
  providedIn: 'root'
})
export class PresentationControllerService {
  presentationMode: boolean = false;
  areEditorsSwapped: boolean = false;

  private _presentationMode = new BehaviorSubject({ presentationMode: false});
  public presentationMode$ = this._presentationMode.asObservable();

  private _errorFlasher = new BehaviorSubject({ line: 0, error: "", content: "" });
  public errorFlasher$ = this._errorFlasher.asObservable();

  private _switchEditors = new BehaviorSubject({ switchEditors: false});
  public switchEditors$ = this._switchEditors.asObservable();

  private _memoryUpdate = new BehaviorSubject({ address: 0, value: 0});
  public memoryUpdate$ = this._memoryUpdate.asObservable();

  private _memoryViewRefresher = new BehaviorSubject({bool: false, methodEntries: [{name: "", address: 0}], constantEntries: [{name: "", address: 0}], generalEntries: [{name: "", address: 0}]});
  public memoryViewRefresher$ = this._memoryViewRefresher.asObservable();


  constructor(
    private macroProvider: MacroProviderService,
    private mainMemory: MainMemoryService,
    private regProvider: RegProviderService,
  ) { }

  ngOnInit(){
    this.mainMemory.updateMemory$.subscribe(content =>{
      this.updateMemoryView(content.address, content.value);
    })
  }


  public toggleMode(){
    if(this.presentationMode == false){
      this.presentationMode = true;
      this._presentationMode.next({ presentationMode: true});
    }
    else{
      this.presentationMode = false;
      this._presentationMode.next({ presentationMode: false});
    }
  }

  getPresentationMode(){
    return this.presentationMode;
  }

  flashErrorInMacro(line: number, error: string){
    let content = "macrocode:" + this.macroProvider.getEditorLineWithParserLine(line) + "\t->\t" + error;
    this._errorFlasher.next({ line: line, error: error , content: content});
  }

  switchEditors(){
    this.areEditorsSwapped = !this.areEditorsSwapped;
    this._switchEditors.next({ switchEditors: this.areEditorsSwapped});
  }

  updateMemoryView(address: number, value: number){
    this._memoryUpdate.next({address: address, value: value})
  }

  memoryViewRefresher(bool: boolean){
    let methodEntries: {name: string, address: number}[] = [];
    let constantEntries: {name: string, address: number}[] = [];
    let generalEntries: {name: string, address: number}[] = [];

    // set MethodArea
    for (let i = 0; i < this.mainMemory.methodAreaSize; i++) {
      methodEntries.push( {name: this.mainMemory.dec2hex(i) + " " + this.mainMemory.get_8(i,true), address: i});
    }

    // set ConstantPool
    let start = this.regProvider.getRegister("CPP").getValue() * 4;
    for (let i = start; i < start + this.mainMemory.constantPoolSize; i += 4) {
      constantEntries.push( {name: this.mainMemory.dec2hex(i) + " " + this.mainMemory.get_32(i), address: i});
    }

    // set GeneralArea
    start = this.regProvider.getRegister("CPP").getValue() * 4 + this.mainMemory.constantPoolSize;
    const keys = Object.keys(this.mainMemory.getMemory()).filter(address => parseInt(address) >= start).sort();
    for (let i = 0; i < keys.length; i += 4) {
      generalEntries.push( {name: this.mainMemory.dec2hex(parseInt(keys[i])) + " " + this.mainMemory.get_32(parseInt(keys[i])), address: i});
    }

    this._memoryViewRefresher.next({bool, methodEntries, constantEntries, generalEntries});
  }

  getRegisterValue(reg: string){
    return this.regProvider.getRegister(reg).getValue();
  }

}
