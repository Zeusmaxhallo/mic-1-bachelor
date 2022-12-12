import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DirectorService } from 'src/app/Controller/director.service';
import { BBusService } from 'src/app/Controller/Emulator/b-bus.service';
import { ABusComponent } from '../SVG/a-bus/a-bus.component';
import { BBusComponent } from '../SVG/b-bus/b-bus.component';
import { CBusComponent } from '../SVG/c-bus/c-bus.component';

@Component({
  selector: 'app-mic-visualization',
  templateUrl: './mic-visualization.component.svg',
  styleUrls: ['./mic-visualization.component.css']
})
export class MicVisualizationComponent implements AfterViewInit {
  @ViewChild("bBus") bBus:BBusComponent;
  @ViewChild("cBus") cBus:CBusComponent;
  @ViewChild("aBus") aBus:ABusComponent;

  constructor(
    private bBusService: BBusService,
    private director: DirectorService,
    ) { }

  endAnimation(event:string){
    console.log(event)
  }

  ngAfterViewInit(): void {

    this.bBusService.activation.subscribe(reg => {
      if( reg[0] ){
        let regName = reg[0];
        let regValue = reg[1]
        this.bBus.startAnimation(regName, regValue)
      }
    } )

    this.cBus.startAnimation(["MAR"],10);
    this.aBus.startAnimation(10);

  }

}
