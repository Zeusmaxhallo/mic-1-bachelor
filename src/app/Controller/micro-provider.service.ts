import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MicroProviderService {

  private micro: string = "";

  constructor() { }

  //Is called when the User presses the export button
  setMicro(micro: string){
    this.micro = micro;    
  }

  getMicro(){
    return this.micro;
  }
}
