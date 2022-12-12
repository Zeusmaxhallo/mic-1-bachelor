import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';

@Component({
  selector: '[app-b-bus]',
  templateUrl: './b-bus.component.html',
  styleUrls: ['./b-bus.component.css']
})
export class BBusComponent implements AfterViewInit {
  @ViewChild("anim") anim: ElementRef;
  @Input() speed: number = 2;
  @Output() endEvent = new EventEmitter<string>()


  constructor() { }

  ngAfterViewInit(): void { }

  public init = true; // without init the animation starts on Page refresh
  public visible = false;
  public path:string = "M 289  87 365  87 365 723"
  public value=2; // display the value inside the circle

  public duration = 1; 

  public paths: {[key:string]: string} = {
    "MDR" : "M 289  87 365  87 365 723",
    "PC"  : "M 289 157 365 157 365 723",
    "MBR" : "M 289 229 365 229 365 723",
    "MBRU": "M 289 240 365 240 365 723",
    "SP"  : "M 289 301 365 301 365 723",
    "LV"  : "M 289 371 365 371 365 723",
    "CPP" : "M 289 443 365 443 365 723",
    "TOS" : "M 289 513 365 513 365 723",
    "OPC" : "M 289 584 365 584 365 723",
  }

  private getPathLength(path:string){
    let coordinates = path.split(/\s+/).slice(1).map(x=> parseInt(x)) // get [x1,y1,x2,y2,...]coordinates remove "M"
    const calcDist = (x1:number, y1:number, x2:number, y2:number) => Math.sqrt((x2 - x1)**2 + (y2 - y1)**2);

    let dist = 0;
    for( let i = 0; i<coordinates.length; i+=2){
      if(coordinates[i+2] && coordinates[i+3]){
        dist += calcDist(coordinates[i],coordinates[i+1],coordinates[i+2],coordinates[i+3]);
      }
    }
    return dist
  }

  private calcDuration(path:string){
    // t = s/v
    return this.getPathLength(path)/(this.speed * 100);
  }

  async startAnimation(reg: string, value: number){

    // set animation path to path of current Register
    this.path = this.paths[reg];
    this.duration = this.calcDuration(this.path);


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
      this.endEvent.emit("B-Bus animation complete");
    }
    
  }
}
