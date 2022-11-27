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

  constructor(
    private controllerService: ControllerService,
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
    this.memory.setCode([0,16,1,16,2,16,3,16,4,16,5,16,6,54,1]);  // some example Code (5 x Bipush)
    this.memory.setConstants([8,16,32,64]);             // some example constants  
    this.memory.createVariables(2);

    this.memory.printMemory();
    console.log("first word on stack is at address: " + this.memory.stackStartAddress);
    
    //this.memory.save2LocalStorage();
    //this.memory.getFromLocalStorage();
    
  }

  run(){
    this.controlStore.loadMicro();
    this.director.step();
    this.memory.save2LocalStorage();
  }
}
