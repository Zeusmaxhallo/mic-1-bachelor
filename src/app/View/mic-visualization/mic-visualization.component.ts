import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BBusService } from 'src/app/Controller/Emulator/b-bus.service';
import { BBusComponent } from '../SVG/b-bus/b-bus.component';

@Component({
  selector: 'app-mic-visualization',
  templateUrl: './mic-visualization.component.svg',
  styleUrls: ['./mic-visualization.component.css']
})
export class MicVisualizationComponent implements AfterViewInit {
  @ViewChild("bBus") bBus:BBusComponent;

  constructor(private bBusService: BBusService) { }

  test(event:string){
    console.log(event);
  }

  ngAfterViewInit(): void {
    this.bBusService.activation.subscribe(reg => {
      if( reg[0] ){
        let regName = reg[0];
        let regValue = reg[1]
        this.bBus.startAnimation(regName, regValue)
      }
    } )
  }

}
