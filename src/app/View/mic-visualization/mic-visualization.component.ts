import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DirectorService } from 'src/app/Controller/director.service';
import { BBusResult, BBusService } from 'src/app/Controller/Emulator/b-bus.service';
import { CBusResult } from 'src/app/Controller/Emulator/c-bus.service';
import { ABusComponent } from '../SVG/a-bus/a-bus.component';
import { BBusComponent } from '../SVG/b-bus/b-bus.component';
import { CBusComponent } from '../SVG/c-bus/c-bus.component';
import { ShifterComponent } from '../SVG/shifter/shifter.component';

@Component({
  selector: 'app-mic-visualization',
  templateUrl: './mic-visualization.component.svg',
  styleUrls: ['./mic-visualization.component.css']
})
export class MicVisualizationComponent implements AfterViewInit {
  @ViewChild("bBus") bBus: BBusComponent;
  @ViewChild("cBus") cBus: CBusComponent;
  @ViewChild("aBus") aBus: ABusComponent;
  @ViewChild("shifter") shifter: ShifterComponent;

  constructor(
    private bBusService: BBusService,
    private director: DirectorService,
  ) { }

  endAnimation(event: string) {
    console.log(event)
  }

  ngAfterViewInit(): void {


    this.director.startAnimation.subscribe(
      results => {
        if (results[0]) {
          let bBusResult: BBusResult = results[0];
          let aluResult: number = results[1];
          let shifterResult: number = results[2];
          let cBusResult: CBusResult = results[3];
          let aBusResult: number = results[4];

          let bBusAnimation = this.bBus.startAnimation(bBusResult.register, bBusResult.value);
          this.aBus.startAnimation(aBusResult);
          bBusAnimation.then(() => {
            console.log("B-Bus animation complete");
            let shifterAnimation = this.shifter.startAnimation(aluResult);
            shifterAnimation.then(() => {
              this.cBus.startAnimation(["MDR","LV"], cBusResult.value); //cBusResult.registers
            })
            
          })
        }

      }
    )

  }

}
