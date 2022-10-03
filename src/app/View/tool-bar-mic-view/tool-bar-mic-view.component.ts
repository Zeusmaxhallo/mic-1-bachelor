import { Component, DebugElement, OnInit } from '@angular/core';
import { ControllerService } from 'src/app/Controller/controller.service';
import { AluService } from 'src/app/Controller/Emulator/alu.service';
import { BBusService } from 'src/app/Controller/Emulator/b-bus.service';
import { CBusService } from 'src/app/Controller/Emulator/c-bus.service';
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
    private busC: CBusService) {}

  ngOnInit(): void {
  }

  step(){
    this.controllerService.step();
  }

  reset(){
    this.controllerService.reset();
  }

  run(){
    this.busB.activate([0,0,0,1]);
    let result = this.alu.calc([1,1,1,0,0,1]);
    result = this.shifter.shift([0,0], result)
    this.busC.activate([1,1,1,1,1,1,0,0,0], result)
  }
}
