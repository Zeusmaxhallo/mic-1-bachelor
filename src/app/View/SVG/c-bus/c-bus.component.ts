import { AfterViewInit, Component, ElementRef, Input, QueryList, ViewChildren } from '@angular/core';
import { SvgUtilitiesService } from '../svg-utilities.service';

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
  @ViewChildren("anim") animationReferences: QueryList<ElementRef>;


  public visible = false;
  public init = true;
  public value:number;
  public animations: animation[] = [];
  
  private currentlyAnimating: string[] = [];

  private paths: {[reg:string]:string} = {
    "H"   : "M 273 867 123 867 123 659 171 659",
    "OPC" : "M 273 867 123 867 123 583 171 583",
    "TOS" : "M 273 867 123 867 123 515 171 515",
    "CPP" : "M 273 867 123 867 123 443 171 443",
    "LV"  : "M 273 867 123 867 123 378 171 378",
    "SP"  : "M 273 867 123 867 123 303 171 303",
    "PC"  : "M 273 867 123 867 123 157 171 157",
    "MDR" : "M 273 867 123 867 123 82  171 82",
    "MAR" : "M 273 867 123 867 123 17  171 17",
  }

  constructor( private svgUtilities: SvgUtilitiesService) { }
  ngAfterViewInit(): void {
    this.resetAnim();
  }

  private resetAnim(){
    let name : keyof typeof this.paths;
    for (name in this.paths){
      let anim: animation = {
        "name" : name,
        "path": this.paths[name],
        "duration": this.svgUtilities.calcDuration(this.paths[name], this.speed),
        "visible": false,
      }
      this.animations.push(anim);
    }
  }

  async startAnimation(regs: Array<string>, value: number){

    this.currentlyAnimating = regs;

    for (let i = 0; i < this.animations.length; i++){
      if (regs.includes(this.animations[i].name)){
        this.animations[i].visible = true;
        this.animations[i].duration = this.svgUtilities.calcDuration(this.animations[i].path, this.speed);
      }else {
        this.animations[i].visible = false;
      }
    }
    
    this.value = value;

    let delay = function (ms:number){
      return new Promise( resolve => setTimeout(resolve, ms))
    }
    await delay(1);

    // start Animation
    for (let anim of this.animationReferences.toArray()){
      anim.nativeElement.beginElement();
    }
    this.init = false;
  }


  begin(name:string){
    if(!this.init && this.currentlyAnimating.includes(name)){
      this.visible = true;
      console.log(name + " animation start");
    }
  }

  end(name:string){
    if (!this.currentlyAnimating.includes(name) || this.init){
      return;
    }
    for(let i = 0; i < this.animations.length; i++){
      if (this.animations[i].name = name){
        console.log(name + " animation complete")
        this.animations[i].visible = false;
        break;
      }
    }
  }
}
