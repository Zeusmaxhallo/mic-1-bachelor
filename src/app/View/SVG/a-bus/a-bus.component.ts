import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SvgUtilitiesService } from '../svg-utilities.service';
declare let anime: any;


@Component({
  selector: '[app-a-bus]',
  templateUrl: './a-bus.component.html',
  styleUrls: ['./a-bus.component.css']
})
export class ABusComponent implements OnInit {
  @ViewChild("anim") anim: ElementRef;
  @Input() speed: number = 2;
  @Output() endEvent = new EventEmitter<string>()

  public visible = false;
  public init = true;
  public value: number;


  public duration: number = 1;
  public path = "M 248.5 542 248.5 587"

  constructor(private svgUtilities: SvgUtilitiesService) { }

  ngOnInit(): void {
  }

  startAnimation(value: number) {

    if (!value){return;}

    this.value = value;
    console.log("aBus value: ", value)
    let duration = this.svgUtilities.calcDuration(this.path, this.speed);

    let timeline = anime.timeline({
      easing: 'easeInOutSine',
      duration: 750,
      loop: 1,
      });

    const path = anime.path(".aAnimationPath")

    timeline.add({
      targets: ".aBusContent",
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
