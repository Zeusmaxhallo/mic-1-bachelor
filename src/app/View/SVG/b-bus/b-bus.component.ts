import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { BBusResult } from 'src/app/Controller/Emulator/b-bus.service';
import { SvgUtilitiesService } from '../svg-utilities.service';
declare let anime: any;


@Component({
  selector: '[app-b-bus]',
  templateUrl: './b-bus.component.html',
  styleUrls: ['./b-bus.component.css']
})
export class BBusComponent implements AfterViewInit {
  @Input() speed: number = 2;
  @Output() endEvent = new EventEmitter<string>()


  constructor(private svgUtilities: SvgUtilitiesService) { }

  ngAfterViewInit(): void {
  }

  public visible = false;
  public path: string = "M 289  87 365  87 365 723"
  public value: number; // display the value inside the circle

  public duration = 1;

  public paths: { [key: string]: string } = {
    "MDR": "M   289  87   365  87   365 708",
    "PC":  "M   289 157   365 157   365 708",
    "MBR": "M   289 229   365 229   365 708",
    "MBRU":"M   289 240   365 240   365 708",
    "SP":  "M   289 301   365 301   365 708",
    "LV":  "M   289 371   365 371   365 708",
    "CPP": "M   289 443   365 443   365 708",
    "TOS": "M   289 513   365 513   365 708",
    "OPC": "M   289 584   365 584   365 708",
  }

  async startAnimation(reg: string, value: number) {
    this.path = this.paths[reg];
    this.value = value;
    let duration = this.svgUtilities.calcDuration(this.path, this.speed);


    let delay = function (ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
    await delay(1);

    let timeline = anime.timeline({
      easing: 'easeOutExpo',
      duration: 750,
      loop: 1,
    });

    const path = anime.path(".bAnimationPath")

    timeline.add({
      targets: ".bBusContent",
      translateX: path("x"),
      translateY: path('y'),
      easing: 'easeInOutSine',
      duration: duration * 1000,
      begin: () => { this.visible = true },
      complete: () => { this.visible = false },
    })

    return timeline.finished;



  }



  /*
    // set animation path to path of current Register
    this.path = this.paths[reg];
    this.value = value;
    this.duration = this.svgUtilities.calcDuration(this.path, this.speed);


    let delay = function (ms:number){
      return new Promise( resolve => setTimeout(resolve, ms))
    }
    await delay(1);

    // start animation
    this.anim.nativeElement.beginElement();
    this.init = false;
  }

  begin() {
    // make Animation visible
    this.visible = true;
  }

  end() {
    this.visible = false;
    if(!this.init){
      this.endEvent.emit("bBus");
    }
    
  }
  */
}
