import { Injectable } from '@angular/core';
import { AluService } from './Emulator/alu.service';
import { BBusService } from './Emulator/b-bus.service';
import { CBusService } from './Emulator/c-bus.service';
import { ParserService } from './Emulator/parser.service';
import { ShifterService } from './Emulator/shifter.service';

@Injectable({
  providedIn: 'root'
})
export class DirectorService {

  constructor(
    private parser: ParserService,
    private alu: AluService,
    private bBus: BBusService,
    private cBus: CBusService,
    private shifter: ShifterService,
    ) { }

  public step(){
    // TOS = PC
    const tokens = [
      {type: 'REGISTER', value: 'TOS'},
      {type: 'ASSIGNMENT_OPERATOR', value: '='},
      {type: 'REGISTER', value: 'PC'}
    ]

    this.parser.init(tokens,0);
    let parsedResult = this.parser.parse();
    console.log(parsedResult);

    this.bBus.activate(parsedResult.b);
    let result = this.alu.calc(parsedResult.alu.slice(2));
    result = this.shifter.shift(parsedResult.alu.slice(0,2), result)
    this.cBus.activate(parsedResult.c,result);


  }


}
