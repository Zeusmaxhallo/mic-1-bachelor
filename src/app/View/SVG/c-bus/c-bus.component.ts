import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: '[app-c-bus]',
  templateUrl: './c-bus.component.html',
  styleUrls: ['./c-bus.component.css']
})
export class CBusComponent implements AfterViewInit {
  @Input() speed: number = 2;
  @ViewChild("anim") anim: ElementRef;


  public visible = false;
  public init = true;
  
  
  public duration:number = 3;
  public path = "M 273 867 123  867 123 17  171 17"

  private paths: {[reg:string]:string} = {
    "H"   : "M 273 867 123  867 123 659 171 659",
    "OPC" : "M 273 867 123  867 123 583 171 583",
    "TOS" : "M 273 867 123  867 123 515 171 515",
    "CPP" : "M 273 867 123  867 123 443 171 443",
    "LV"  : "M 273 867 123  867 123 378 171 378",
    "SP"  : "M 273 867 123  867 123 303 171 303",
    "PC"  : "M 273 867 123  867 123 157 171 157",
    "MDR" : "M 273 867 123  867 123 82  171 82",
    "MAR" : "M 273 867 123  867 123 17  171 17",
  }

  constructor() { }
  ngAfterViewInit(): void {}

  startAnimation(regs: Array<string>, value: number){
    this.path = this.paths[regs[0]];

    //this.duration = 3;


    // start Animation
    this.anim.nativeElement.beginElement();
    this.init = false;
  }


  begin(){
    this.visible = true;
    console.log("c-bus animation start");
    
  }

  end(){
    this.visible = false;
    console.log("c-bus animation end")
  }



}
