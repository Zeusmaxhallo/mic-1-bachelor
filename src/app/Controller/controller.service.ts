import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { ParserService } from './Emulator/parser.service';
import { IntegrationTestService } from './integration-test.service';
import { MacroProviderService } from './macro-provider.service';
import { MicroProviderService } from './micro-provider.service';
import { RegProviderService } from './reg-provider.service';

@Injectable({
  providedIn: 'root'
})
export class ControllerService {

  constructor(private regProvider: RegProviderService, private macroProvider: MacroProviderService, 
    private microProvider: MicroProviderService, private integrationTestService: IntegrationTestService,
    private parser: ParserService) { }

  step(){
    let PC = this.regProvider.getRegister("PC");
    PC.setValue(PC.getValue() + 1);
  }

  reset(){
    let PC = this.regProvider.getRegister("PC");
    PC.setValue(0);
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

  integrationTest(){
    this.integrationTestService.testMacro();
    this.integrationTestService.testMicro();
  }

  testMicro(){
    let microLines = this.microProvider.getMicro().split("\n");
    this.parser.labels = {}; // reset labels or u get DuplicateLabelError after testing twice
    let microProgram = this.parser.index(microLines);
  }
}
