import { Component, DebugElement, OnInit } from '@angular/core';
import { ControllerService } from 'src/app/Controller/controller.service';
import { AluService } from 'src/app/Controller/Emulator/alu.service';
import { BBusService } from 'src/app/Controller/Emulator/b-bus.service';
import { CBusService } from 'src/app/Controller/Emulator/c-bus.service';
import { ParserService } from 'src/app/Controller/Emulator/parser.service';
import { ShifterService } from 'src/app/Controller/Emulator/shifter.service';

@Component({
  selector: 'app-tool-bar-mic-view',
  templateUrl: './tool-bar-mic-view.component.html',
  styleUrls: ['./tool-bar-mic-view.component.css']
})
export class ToolBarMicViewComponent implements OnInit {

  constructor(private controllerService: ControllerService,
    private busB: BBusService,
    private alu: AluService,
    private shifter: ShifterService,
    private busC: CBusService,
    private parser: ParserService) {}

  ngOnInit(): void {
  }

  step(){
    this.controllerService.step();
  }

  reset(){
    this.controllerService.reset();
  }

  run(){
    const instruction = prompt("Enter Instruction:");
    //let instruction = "Label1: H = MDR = TOS = H + PC + 1 << 8 ;wr;"
    console.log(instruction)
    this.parser.init(instruction, 10);
    this.parser.parse();

    //console.log("H = OPC = PC = -1 ;rd;goto Label1")
    //this.parser.init("H = OPC = PC = -1;rd;goto Label1", 11);
    //this.parser.parse();

    this.busB.activate(this.parser.b);
    let result = this.alu.calc(this.parser.alu.slice(2));
    result = this.shifter.shift(this.parser.alu.slice(0,2), result)
    this.busC.activate(this.parser.c, result)
  }
}
