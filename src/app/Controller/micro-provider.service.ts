import { Injectable } from '@angular/core';
import { Microprogramms } from '../Microprogramms/Microprograms';

@Injectable({
  providedIn: 'root'
})
export class MicroProviderService {
  microprogramms: Microprogramms = new Microprogramms();
  micro: string = this.microprogramms.getMicro();

  constructor() { }

  //Is called when the User presses the export button
  setMicro(micro: string){
    this.micro = micro;   
  }

  getMicro(){
    return this.micro;
  }

  resetMicro(){
    this.micro = this.microprogramms.getMicro();
  }
}
