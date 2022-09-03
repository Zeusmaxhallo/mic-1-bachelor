import { Component, DebugElement, OnInit } from '@angular/core';
import { RegProviderService } from 'src/app/Controller/reg-provider.service';

@Component({
  selector: 'app-tool-bar-mic-view',
  templateUrl: './tool-bar-mic-view.component.html',
  styleUrls: ['./tool-bar-mic-view.component.css']
})
export class ToolBarMicViewComponent implements OnInit {

  constructor(private regProvider: RegProviderService) {
  }

  ngOnInit(): void {
  }

  step(){
    let PC = this.regProvider.getRegister("PC");
    PC.setValue(PC.getValue() + 1);
    //This should probably be done in the Controller
  }

}
