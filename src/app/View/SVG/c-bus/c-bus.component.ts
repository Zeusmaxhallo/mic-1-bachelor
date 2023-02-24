import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { RegistersComponent } from '../registers/registers.component';
import { SvgUtilitiesService } from '../svg-utilities.service';
declare let anime: any;


interface animation {
  name: string,
  path: string,
  duration: number,
  visible: boolean,
}

@Component({
  selector: '[app-c-bus]',
  templateUrl: './c-bus.component.html',
  styleUrls: ['./c-bus.component.css']
})
export class CBusComponent implements AfterViewInit {
  @Input() speed: number = 2;
  @ViewChild("registers") registers: RegistersComponent;


  public visible = false;
  public value: number;
  public animations: animation[] = [];

  private currentlyAnimating: string[] = [];

  private paths: { [reg: string]: string } = {
    "H":   "M 273 806  123 806  123 659  171 659",
    "OPC": "M 273 806  123 806  123 583  171 583",
    "TOS": "M 273 806  123 806  123 515  171 515",
    "CPP": "M 273 806  123 806  123 443  171 443",
    "LV":  "M 273 806  123 806  123 378  171 378",
    "SP":  "M 273 806  123 806  123 303  171 303",
    "PC":  "M 273 806  123 806  123 157  171 157",
    "MDR": "M 273 806  123 806  123 82   171 82",
    "MAR": "M 273 806  123 806  123 17   171 17",
  }

  constructor(private svgUtilities: SvgUtilitiesService) { }
  ngAfterViewInit(): void {
    this.resetAnim();
  }

  private resetAnim() {
    let name: keyof typeof this.paths;
    for (name in this.paths) {
      let anim: animation = {
        "name": name,
        "path": this.paths[name],
        "duration": this.svgUtilities.calcDuration(this.paths[name], this.speed),
        "visible": false,
      }
      this.animations.push(anim);
    }
  }

  async startAnimation(regs: Array<string>, value: number) {

    this.value = value;

    // set duration and visibility of each animation
    for (let i = 0; i < this.animations.length; i++) {
      if (regs.includes(this.animations[i].name)) {
        this.animations[i].visible = true;
        this.animations[i].duration = this.svgUtilities.calcDuration(this.animations[i].path, this.speed);
      } else {
        this.animations[i].visible = false;
      }
    }

    let delay = function (ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
    await delay(1);

    // only animate visible animations
    const toAnimate = this.animations.filter(animation => { return animation.visible });

    let lastTimeline: any;

    for (let animation of toAnimate) {

      // start each animation independently with own timeline
      let timeline = anime.timeline({
        easing: 'linear',
        loop: 1,
      });

      const path = anime.path("." + animation.name + "path");

      timeline.add({
        targets: "." + animation.name + "animation",
        translateX: path("x"),
        translateY: path('y'),
        easing: 'easeInOutSine',
        duration: animation.duration * 1000,
        begin: () => { },
        complete: () => {
          animation.visible = false;
          this.registers.showValue(animation.name, this.value);
        }
      })

      lastTimeline = timeline;
    }

    if (!lastTimeline){
      return new Promise(resolve => {setTimeout(resolve, 1)});
    }


    return lastTimeline.finished;
  }

  public setRegisterValues(register: string, value: number, activateArrow: boolean) {
    this.registers.showValue(register, value);

    // return if we don't have to animate arrow
    if(!activateArrow){return;}

    // animate the Memory Arrow
    let timeline = anime.timeline({
      easing: 'linear',
      loop: 6,
    });

    const arrowElement = document.querySelector(".memoryArrow" + register);
    const previousColor = arrowElement.getAttribute("fill");


    timeline.add({
      targets: [arrowElement, ".memoryArrow" + register + "1"],
      fill: "#FFF",
      duration: 400 / this.speed,
    })
    .add({
      targets: [arrowElement, ".memoryArrow" + register + "1"],
      fill: previousColor,
      duration: 400/ this.speed,
    })
  }

}
