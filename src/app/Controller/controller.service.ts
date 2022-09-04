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
}
