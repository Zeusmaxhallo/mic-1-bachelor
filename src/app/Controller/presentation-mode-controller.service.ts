import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})


export class PresentationModeControllerService {
  presentationMode: boolean = false;

  private _presentationMode = new BehaviorSubject({ presentationMode: false});
  public presentationMode$ = this._presentationMode.asObservable();

  constructor() { }

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

}
