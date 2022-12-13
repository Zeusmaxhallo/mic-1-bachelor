import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SvgUtilitiesService {

  constructor() { }

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

  public calcDuration(path:string, speed: number){
    // t = s/v
    return this.getPathLength(path)/(speed * 100);
  }


}
