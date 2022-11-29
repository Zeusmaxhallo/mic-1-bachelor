import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BBusService } from 'src/app/Controller/Emulator/b-bus.service';

@Component({
  selector: 'app-mic-visualization',
  templateUrl: './mic-visualization.component.svg',
  styleUrls: ['./mic-visualization.component.css']
})
export class MicVisualizationComponent implements AfterViewInit {
  @ViewChild("anim") anim: ElementRef;

  constructor(private bBusService: BBusService) { }

  ngOnInit(): void {
  }

  public bBus = false;

  public path = "M 289 87    365 87  365 723"

  public paths = { "MDR": "M 289 87 365 87  365 723" }  // define path for each Reg

  begin(event: Event) {
    console.log(event)
    this.bBus = true
  }

  end(event: Event) {
    console.log(event)
    this.bBus = false;
  }



  public activateBBus() {
    this.anim.nativeElement.beginElement();
  }

  ngAfterViewInit(): void {
    this.bBusService.activation.subscribe(reg => this.activateBBus())
  }

}
