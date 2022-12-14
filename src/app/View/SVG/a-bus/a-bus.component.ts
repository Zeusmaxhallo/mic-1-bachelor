import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SvgUtilitiesService } from '../svg-utilities.service';

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
  public path = "M 248.5 677 248.5 722"

  constructor(private svgUtilities: SvgUtilitiesService) { }

  ngOnInit(): void {
  }

  startAnimation(value: number) {

    // set value and animationSpeed
    this.value = value;
    this.duration = this.svgUtilities.calcDuration(this.path, this.speed);

    // start animation
    this.anim.nativeElement.beginElement();
    this.init = false;
  }

  begin() {
    this.visible = true;
    console.log("a-bus animation start");
  }

  end() {
    this.visible = false;
    if (!this.init) {
      this.endEvent.emit("a-Bus animation complete");
    }
  }

}
