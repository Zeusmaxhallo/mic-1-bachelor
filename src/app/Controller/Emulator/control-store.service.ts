import { Token } from '../tokenizer';
import { Injectable } from '@angular/core';
import { ParserService, Instruction } from 'src/app/Controller/Emulator/parser.service';
import { MicroProviderService } from '../micro-provider.service';

@Injectable({
  providedIn: 'root'
})
export class ControlStoreService {
  private microAddr:{ [instruction: string] : number } = {};
  private micro:{ [address: number] : Token[] };

  constructor(
    private microParser: ParserService,
    private microProvider: MicroProviderService,
    ) { }

  loadMicro(){
    this.microParser.labels = {};
    this.micro = this.microParser.index(this.microProvider.getMicro().split('\n'));
    this.microAddr = this.microParser.labels;
  }

  getMicroAddr(){
    return this.microAddr;
  }
  
  getMicro(){
    return this.micro;
  }
  
}
