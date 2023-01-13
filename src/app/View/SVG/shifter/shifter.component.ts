import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SvgUtilitiesService } from '../svg-utilities.service';
declare let anime: any;

@Component({
  selector: '[app-shifter]',
  templateUrl: './shifter.component.html',
  styleUrls: ['./shifter.component.css']
})
export class ShifterComponent implements AfterViewInit {
  @ViewChild("anim") anim: ElementRef;
  @Input() speed: number = 2;
  @Output() endEvent = new EventEmitter<string>()

  constructor(private svgUtilities: SvgUtilitiesService) { }

  ngAfterViewInit(): void {}

  public visible = false;
  public path:string = "M 308 790  313 840"
  public value:number; // display the value inside the circle

  startAnimation(value: number){

    let duration = this.svgUtilities.calcDuration(this.path, this.speed);
    this.value = value;


    let timeline = anime.timeline({
      easing: 'easeOutExpo',
      duration: 750,
      loop: 1,
      });

    const path = anime.path(".shifterAnimationPath")

    timeline.add({
      targets: ".shifterBusContent",
      translateX: path("x"),
      translateY: path('y'),
      easing: 'linear',
      duration: duration * 1000,
      begin: () => {this.visible = true},
      complete: () => {this.visible = false},
    })

    return timeline.finished

  }

}
