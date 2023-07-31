import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { MainMemoryService } from '../Model/Emulator/main-memory.service';
import { CharacterROMService } from './character-rom.service';

const VRAM_ADDRESS = 1024;
const VRAM_SIZE = 64000;

const SCREEN_HEIGHT = 200;
const SCREEN_WIDTH = 320;

const CHANGE_MODE_ADDRESS = 64001

const COLUMNS = SCREEN_WIDTH / 8;
const ROWS = SCREEN_HEIGHT / 8;


// all 16 VGA TextMode Colors in the right order
const COLORS = [
  "black",            // 0
  "blue",             // 1
  "green",            // 2
  "cyan",             // 3
  "red",              // 4
  "magenta",          // 5
  "brown",            // 6
  "lightGray",        // 7
  "darkGray",         // 8
  "lightBlue",        // 9
  "lightGreen",       // A
  "RGB(128,255,255)", // B   -> lightCyan
  "RGB(255,204,203)", // C   -> lightRed
  "pink",             // D
  "yellow",           // E
  "white",            // F
]


@Injectable({
  providedIn: 'root'
})
export class VideoControllerService {

  private _sendPixel = new BehaviorSubject({ x: 0, y: 0, color: "rgb(0,0,0)" });
  public sendPixel$ = this._sendPixel.asObservable();

  private _wipeScreen = new BehaviorSubject(true);
  public wipeScreen$ = this._wipeScreen.asObservable();

  private textMode = true;


  constructor(
    private mainMemory: MainMemoryService,
    private characterROM: CharacterROMService,
  ) {
    this.mainMemory.updateMemoryView$.subscribe(entry => {
      //filter all relevant changes

      // detect changes in VRAM
      if (entry.address >= VRAM_ADDRESS * 4 && entry.address <= (VRAM_ADDRESS + VRAM_SIZE) * 4) {
        this.updateVis(entry.address, entry.value);
      }

      // detect Mode Change
      if (entry.address === CHANGE_MODE_ADDRESS * 4) {
        this.textMode = !entry.value;
        console.log(this.textMode ? "enabled TextMode" : "enabled graphicsMode");
      }


    })
  }

  private updateVis(address: number, value: number) {

    this.textMode ? this.characterMode(address, value) : this.bitmap(address, value);

  }

  private bitmap(address: number, value: number) {
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

  private characterMode(address: number, value: number) {

    /**
     * on the address is a 32 Bit Word
     * we don't know which one of the 16 Bit values changed
     * -> draw both characters
    */

    let n = (address / 4 - VRAM_ADDRESS) * 2;
    let x = Math.floor(n % COLUMNS) * 8;
    let y = Math.floor(n / COLUMNS) * 8;

    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer, 0);

    view.setInt32(0, value);
    let first = { character: view.getUint8(0), attribute: view.getUint8(1) };
    let second = { character: view.getUint8(2), attribute: view.getUint8(3) };

    let bits = new Array<string>;
    try {
      bits = this.characterROM.getCharacter(first.character).bits;
    } catch (error) {
      console.log("character", first.character, "is not in Character ROM returning 0")
      bits = ["00000000", "00000000", "00000000", "00000000", "00000000", "00000000", "00000000", "00000000"];
    }

    /**
    Bit 76543210
        ||||||||
        |||||^^^-fore color
        ||||^----fore color bright bit
        |^^^-----back color
        ^--------back color bright bit OR enables blinking Text
    */
    let color = COLORS[first.attribute & 0b00001111 ];
    let backgroundColor = COLORS[(first.attribute & 0b01110000) >> 4];

    // first Character
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (parseInt(bits[i][j])) {
          this._sendPixel.next({ x: x + j, y: y + i, color: color });
        } else {
          this._sendPixel.next({ x: x + j, y: y + i, color: backgroundColor });
        }
      }
    }

    // set second Character
    try {
      bits = this.characterROM.getCharacter(second.character).bits;
    } catch (error) {
      console.log("character", second.character, "is not in Character ROM returning 0")
      bits = ["00000000", "00000000", "00000000", "00000000", "00000000", "00000000", "00000000", "00000000"];
    }

    // set color for second Character
    color = COLORS[second.attribute & 0b00001111 ];
    backgroundColor = COLORS[(second.attribute & 0b01110000) >> 4];

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (parseInt(bits[i][j])) {
          this._sendPixel.next({ x: x + j + 8, y: y + i, color: color });
        } else {
          this._sendPixel.next({ x: x + j + 8, y: y + i, color: backgroundColor });
        }
      }
    }
  }

  public wipeScreen() {
    this._wipeScreen.next(true);

  }

}
