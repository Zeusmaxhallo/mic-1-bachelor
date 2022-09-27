import { Inject, Injectable } from '@angular/core';
import { RegProviderService } from '../reg-provider.service';

@Injectable({
  providedIn: 'root'
})

export class BBusService {
  private regProviderService: RegProviderService;
  private regName: string;

  constructor(regProviderService: RegProviderService) {
    this.regProviderService = regProviderService;
   }

  getValue(): number{
    return this.regProviderService.getRegister(this.regName).getValue();
  }  

}
