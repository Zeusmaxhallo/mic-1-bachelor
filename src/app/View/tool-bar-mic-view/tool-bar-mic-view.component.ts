import { Component, DebugElement, OnInit } from '@angular/core';
import { ControllerService } from 'src/app/Controller/controller.service';
import { DirectorService } from 'src/app/Controller/director.service';
import { ControlStoreService } from 'src/app/Controller/Emulator/control-store.service';
import { MainMemoryService } from 'src/app/Controller/Emulator/main-memory.service';
import { RegProviderService } from 'src/app/Controller/reg-provider.service';

@Component({
  selector: 'app-tool-bar-mic-view',
  templateUrl: './tool-bar-mic-view.component.html',
  styleUrls: ['./tool-bar-mic-view.component.css']
})
export class ToolBarMicViewComponent implements OnInit {

  animate = true;
  animationSpeed = 2;

  disableRunButton = true;
  disableStepButton = true;

  constructor(
    private memory: MainMemoryService,
    private director: DirectorService,) {}

  ngOnInit(): void {
    this.director.finishedRun.subscribe( result => {
      result ? this.enableRunButtons() : this.disableRunButtons();
    })
  }

  step(){
    this.director.init();
    this.director.step();
    this.memory.save2LocalStorage();
  }

  stepMacro(){
    this.director.init();
    this.director.runMacroInstruction();
    this.memory.save2LocalStorage();
  }

  reset(){
    this.director.reset();
  }

  private enableRunButtons(){
    this.disableRunButton = false;
    this.disableStepButton = false;
  }

  private disableRunButtons(){
    this.disableRunButton = true;
    this.disableStepButton = true;
  }



  run(){
    this.disableRunButtons();
    this.director.run();
  }


  changeAnimSpeed(event:any){
    this.animationSpeed = event.value;
    this.director.animationSpeed = this.animationSpeed;

  }

  toggleAnimVisibility(){
    this.director.animationEnabled = this.animate;
  }

}
