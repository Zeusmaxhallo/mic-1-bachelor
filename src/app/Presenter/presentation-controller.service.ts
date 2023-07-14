import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MacroProviderService } from '../Model/macro-provider.service';

@Injectable({
  providedIn: 'root'
})
export class PresentationControllerService {
  presentationMode: boolean = false;

  private _presentationMode = new BehaviorSubject({ presentationMode: false});
  public presentationMode$ = this._presentationMode.asObservable();

  private _errorFlasher = new BehaviorSubject({ line: 0, error: "", content: "" });
  public errorFlasher$ = this._errorFlasher.asObservable();

  constructor(
    private macroProvider: MacroProviderService,
  ) { }

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
}
function unbind() {
  throw new Error('Function not implemented.');
}

