import { Component, DebugElement, OnInit } from '@angular/core';
import { ControllerService } from 'src/app/Controller/controller.service';

@Component({
  selector: 'app-tool-bar-mic-view',
  templateUrl: './tool-bar-mic-view.component.html',
  styleUrls: ['./tool-bar-mic-view.component.css']
})
export class ToolBarMicViewComponent implements OnInit {

  constructor(private controllerService: ControllerService) {
  }

  ngOnInit(): void {
  }

  step(){
    this.controllerService.step();
  }

  reset(){
    this.controllerService.reset();
  }
}
