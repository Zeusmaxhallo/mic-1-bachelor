import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { MacroProviderService } from '../Model/macro-provider.service';
import { MicroProviderService } from '../Model/micro-provider.service';
import { RegProviderService } from '../Model/reg-provider.service';
import { ControlStoreService } from '../Controller/Emulator/control-store.service';
import { MacroTokenizerService } from '../Controller/macro-tokenizer.service';
import { MacroParserService } from '../Controller/macro-parser.service';
import { DirectorService } from './director.service';

@Injectable({
  providedIn: 'root'
})
export class ControllerService {

  constructor(
    private macroProvider: MacroProviderService,
    private microProvider: MicroProviderService,
    private controlStore: ControlStoreService,
    private macroTokenizer: MacroTokenizerService,
    private macroParser: MacroParserService,
    private director: DirectorService,
  ) { }

  step(){
    if(this.macroProvider.getMacroGotChanged() || this.microProvider.getMicroGotChanged()){
      this.controlStore.loadMicro();
      this.macroTokenizer.init();
      this.macroParser.parse();
      this.director.reset();
    }

    this.director.init();
    this.director.step();

    this.macroProvider.isLoaded();
    this.microProvider.isLoaded();
  }

  stepMacro(){
    if(this.macroProvider.getMacroGotChanged() || this.microProvider.getMicroGotChanged()){
      this.controlStore.loadMicro();
      this.macroTokenizer.init();
      this.macroParser.parse();
      this.director.reset();
    }

    this.director.init();
    this.director.runMacroInstruction();

    this.macroProvider.isLoaded();
    this.microProvider.isLoaded();
  }

  reset(){
    this.director.reset();

    // step through INVOKEVIRUAL for main method
    this.stepMacro();
  }

  run(){
    if(this.macroProvider.getMacroGotChanged() || this.microProvider.getMicroGotChanged()){
      this.controlStore.loadMicro();
      this.macroTokenizer.init();
      this.macroParser.parse();
      this.director.reset();
    }

    this.director.run();

    this.macroProvider.isLoaded();
    this.microProvider.isLoaded();
  }

  //reads the imported file and sets it in the macroassembler editor
  importMacro(file: any){
    if(file.type === "text/plain"){
      let fileReader = new FileReader();
      fileReader.readAsText(file);

      fileReader.onload = (e) => {
        this.macroProvider.setMacro(fileReader.result.toString());
      }

    }else{
      alert("Wrong file type!")
    }
  }

  //reads the imported file and sets it in the microprograms editor
  importMicro(file: any){
    if(file.type === "text/plain"){
      let fileReader = new FileReader();
      fileReader.readAsText(file);

      fileReader.onload = (e) => {
        this.microProvider.setMicro(fileReader.result.toString());
      }

    }else{
      alert("Wrong file type!")
    }
  }

  //downloads a txt file with the macrocode as content
  exportMacro(){
    var textMac: string = this.macroProvider.getMacro();
    var data = new Blob([textMac], {type: 'text/plain'});
    FileSaver.saveAs(data, 'macro.txt');
  }

  exportMicro(){
    var textMic: string = this.microProvider.getMicro();
    var data = new Blob([textMic], {type: 'text/plain'});
    FileSaver.saveAs(data, 'micro.txt');
  }
}
