import { Inject, Injectable } from '@angular/core';
import { RegProviderService } from '../reg-provider.service';

@Injectable({
  providedIn: 'root'
})

export class BBusService {
  private regProviderService: RegProviderService;

  constructor(regProviderService: RegProviderService) {
    this.regProviderService = regProviderService;
   }
  
  getValue(regNum: number): number{
    switch(regNum){
      case 0: return this.regProviderService.getRegister("MDR").getValue();
      case 1: return this.regProviderService.getRegister("PC").getValue();
      case 2: return this.regProviderService.getRegister("MBR").getValue();
      case 3: return this.regProviderService.getRegister("MBRU").getValue();
      case 4: return this.regProviderService.getRegister("SP").getValue();
      case 5: return this.regProviderService.getRegister("LV").getValue();
      case 6: return this.regProviderService.getRegister("CPP").getValue();
      case 7: return this.regProviderService.getRegister("TOS").getValue();
      case 8: return this.regProviderService.getRegister("OPC").getValue();
      default: return null;
    }
  } 
}
