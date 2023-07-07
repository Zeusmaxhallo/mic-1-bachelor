import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { MainMemoryService } from '../Controller/Emulator/main-memory.service';
import { add, random } from 'cypress/types/lodash';

const VRAM_ADDRESS = 1024;
const VRAM_SIZE = 64000;

const SCREEN_HEIGHT = 200;
const SCREEN_WIDTH = 320;


@Injectable({
  providedIn: 'root'
})
export class VideoControllerService {

  private _sendPixel = new BehaviorSubject({ x: 0, y: 0, color: "rgb(0,0,0)" });
  public sendPixel$ = this._sendPixel.asObservable();

  private _wipeScreen = new BehaviorSubject(true);
  public wipeScreen$ = this._wipeScreen.asObservable();


  constructor(
    private mainMemory: MainMemoryService
  ) {
    this.mainMemory.memoryUpdate$.subscribe(entry => {
      //filter all relevant changes
      if (entry.address >= VRAM_ADDRESS * 4 && entry.address <= (VRAM_ADDRESS + VRAM_SIZE) * 4) {
        this.updateVis(entry.address, entry.value);
      }
    })

  }

  private updateVis(address: number, value: number) {

    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer, 0);

    view.setInt32(0, value);
    let r = view.getUint8(1);
    let g = view.getUint8(2);
    let b = view.getUint8(3);

    // calc the nth pixel
    let n = address / 4 - VRAM_ADDRESS
    let x = n % SCREEN_WIDTH
    let y = Math.floor(n / SCREEN_WIDTH);
    console.log(n)
    console.log(x, y)

    this._sendPixel.next({ x: x, y: y, color: `rgb(${r},${g},${b})` })
  }

  public wipeScreen() {
    this._wipeScreen.next(true);

  }



}
