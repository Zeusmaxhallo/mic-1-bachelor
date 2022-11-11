import { Component, DebugElement, OnInit } from '@angular/core';
import { ControllerService } from 'src/app/Controller/controller.service';
import { DirectorService } from 'src/app/Controller/director.service';
import { AluService } from 'src/app/Controller/Emulator/alu.service';
import { BBusService } from 'src/app/Controller/Emulator/b-bus.service';
import { CBusService } from 'src/app/Controller/Emulator/c-bus.service';
import { ControlStoreService } from 'src/app/Controller/Emulator/control-store.service';
import { MainMemoryService } from 'src/app/Controller/Emulator/main-memory.service';
import { ParserService } from 'src/app/Controller/Emulator/parser.service';
import { ShifterService } from 'src/app/Controller/Emulator/shifter.service';
import { RegProviderService } from 'src/app/Controller/reg-provider.service';

@Component({
  selector: 'app-tool-bar-mic-view',
  templateUrl: './tool-bar-mic-view.component.html',
  styleUrls: ['./tool-bar-mic-view.component.css']
})
export class ToolBarMicViewComponent implements OnInit {

  constructor(private controllerService: ControllerService,
    private memory: MainMemoryService,
    private director: DirectorService,
    private controlStore: ControlStoreService,
    private regProvider: RegProviderService,) {}

  ngOnInit(): void {
  }

  step(){
    this.controllerService.step();
    this.regProvider.getRegister("MBR").setValue(this.regProvider.getRegister("MBR").getValue() + 1);
  }

  reset(){
    this.controllerService.reset();


    // ---   test MainMemory functionality  ---
    this.memory.store_32(0,-16);
    this.memory.store_32(8,16);
    this.memory.store_32(16,1023);

    //this.memory.save2LocalStorage();
    //this.memory.getFromLocalStorage();
    this.memory.printMemory();

    console.log(this.memory.get_32(0));
    console.log(this.memory.get_8(3));


  }

  run(){
    this.controlStore.loadMicro();
    this.director.step();

    //const instruction = prompt("Enter Instruction");
    //this.parser.compile([instruction]);

  

    //this.parser.compile(["Main1: PC=PC+1; fetch;",
    //"(0x60)iadd1: MAR=SP=SP-1; rd",
    //"H=TOS","MDR=TOS=MDR+H; wr;",
    //"(0x64)isub1: MAR=SP=SP-1; rd",
    //"H=TOS"])
    //
    //const instruction = prompt("Enter Instruction:");
    //let instruction = "Label1: H = MDR = TOS = H + PC + 1 << 8 ;wr;"
    //console.log(instruction)
    //this.parser.init(instruction, 10);
    //this.parser.parse();

    //console.log("H = OPC = PC = -1 ;rd;goto Label1")
    //this.parser.init("H = OPC = PC = -1;rd;goto Label1", 11);
    //this.parser.parse();

    //this.busB.activate(this.parser.b);
    //let result = this.alu.calc(this.parser.alu.slice(2));
    //result = this.shifter.shift(this.parser.alu.slice(0,2), result)
    //this.busC.activate(this.parser.c, result)
    //console.table(this.parser.labels);
  }
}
