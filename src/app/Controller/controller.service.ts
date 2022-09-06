import { Injectable } from '@angular/core';
import { RegProviderService } from './reg-provider.service';

@Injectable({
  providedIn: 'root'
})
export class ControllerService {

  constructor(private regProvider: RegProviderService) { }

  step(){
    let PC = this.regProvider.getRegister("PC");
    PC.setValue(PC.getValue() + 1);
  }

  reset(){
    let PC = this.regProvider.getRegister("PC");
    PC.setValue(0);
  }

  //reads the imported file and does a console log with the content
  import(file: any){
    if(file.type === "text/plain"){
      let fileReader = new FileReader();
      fileReader.readAsText(file);
      fileReader.onload = (e) => {
        console.log(fileReader.result);
      }
    }else{
      alert("Wrong file type!")
    }
  }
}
