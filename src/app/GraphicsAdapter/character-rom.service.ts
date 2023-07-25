import { Injectable } from '@angular/core';

export interface Character {
  address: number;
  bits: string[];
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CharacterROMService {

  private Characters = new Array<Character>;

  constructor() {

    this.Characters.push(
      { address: 31, name: "Full", bits: ["11111111", "11111111", "11111111", "11111111", "11111111", "11111111", "11111111", "11111111"] },
      { address: 32, name: "Space", bits: ["00000000", "00000000", "00000000", "00000000", "00000000", "00000000", "00000000", "00000000"] },

      { address: 65, name: "A", bits: ["00011000", "00111100", "01100110", "01111110", "01100110", "01100110", "01100110", "00000000"] },
      { address: 66, name: "B", bits: ["01111100", "01100110", "01100110", "01111100", "01100110", "01100110", "01111100", "00000000"] },
      { address: 67, name: "C", bits: ["00111100", "01100110", "01100000", "01100000", "01100000", "01100110", "00111100", "00000000"] },
      { address: 68, name: "D", bits: ["01111000", "01101100", "01100110", "01100010", "01100110", "01101100", "01111000", "00000000"] },
      { address: 69, name: "E", bits: ["01111110", "01100000", "01100000", "01111000", "01100000", "01100000", "01111110", "00000000"] },
      { address: 70, name: "F", bits: ["01111110", "01100000", "01100000", "01111000", "01100000", "01100000", "01100000", "00000000"] },
      { address: 71, name: "G", bits: ["00111100", "01100110", "01100000", "01101110", "01100110", "01100110", "00111100", "00000000"] },
      { address: 72, name: "H", bits: ["01100110", "01100110", "01100110", "01111110", "01100110", "01100110", "01100110", "00000000"] },
      { address: 73, name: "I", bits: ["00111100", "00011000", "00011000", "00011000", "00011000", "00011000", "00111100", "00000000"] },
      { address: 74, name: "J", bits: ["00011110", "00001100", "00001100", "00001100", "00001100", "01101100", "00111000", "00000000"] },
      { address: 75, name: "K", bits: ["01100110", "01101100", "01111000", "01100000", "01111000", "01101100", "01100110", "00000000"] },
      { address: 76, name: "L", bits: ["01100000", "01100000", "01100000", "01100000", "01100000", "01100000", "01111110", "00000000"] },
      { address: 77, name: "M", bits: ["01100011", "01110111", "01111111", "01101011", "01100011", "01100011", "01100011", "00000000"] },
      { address: 78, name: "N", bits: ["01100011", "01110011", "01111111", "01111111", "01100111", "01100011", "01100011", "00000000"] },
      { address: 79, name: "O", bits: ["00111100", "01100110", "01100110", "01100110", "01100110", "01100110", "00111100", "00000000"] },
      { address: 80, name: "P", bits: ["01111100", "01100110", "01100110", "01111100", "01100000", "01100000", "01100000", "00000000"] },
      { address: 81, name: "Q", bits: ["00111100", "01100110", "01100110", "01100110", "01100110", "01111100", "00001110", "00000000"] },
      { address: 82, name: "R", bits: ["01111100", "01100110", "01100110", "01111100", "01111000", "01101100", "01100110", "00000000"] },
      { address: 83, name: "S", bits: ["00111100", "01100110", "01100000", "00111100", "00000110", "01100110", "00111100", "00000000"] },
      { address: 84, name: "T", bits: ["01111110", "00011000", "00011000", "00011000", "00011000", "00011000", "00011000", "00000000"] },
      { address: 85, name: "U", bits: ["01100110", "01100110", "01100110", "01100110", "01100110", "01100110", "00111100", "00000000"] },
      { address: 86, name: "V", bits: ["01100110", "01100110", "01100110", "01100110", "01100110", "00111100", "00011000", "00000000"] },
      { address: 87, name: "W", bits: ["01100010", "01100011", "01100011", "01101011", "01111111", "01110111", "01100011", "00000000"] },
      { address: 88, name: "X", bits: ["01100110", "01100110", "00111100", "00011000", "00111100", "01100110", "01100110", "00000000"] },
      { address: 89, name: "Y", bits: ["01100110", "01100110", "01100110", "00111100", "00011000", "00011000", "00011000", "00000000"] },
      { address: 90, name: "Z", bits: ["01111110", "00000110", "00001100", "00011000", "00110000", "01100000", "01111110", "00000000"] },


      { address: 97, name: "a", bits: ["00000000", "00000000", "00111100", "00000110", "00111110", "01100110", "00111110", "00000000"] },
      { address: 98, name: "b", bits: ["00000000", "01100000", "01100000", "01111100", "01100110", "01100110", "01111100", "00000000"] },
      { address: 99, name: "c", bits: ["00000000", "00000000", "00111100", "01100000", "01100000", "01100000", "00111100", "00000000"] },
      { address: 100, name: "d", bits: ["00000000", "00000110", "00000110", "00111110", "01100110", "01100110", "00111110", "00000000"] },
      { address: 101, name: "e", bits: ["00000000", "00000000", "00111100", "01100110", "01111110", "01100000", "00111100", "00000000"] },
      { address: 102, name: "f", bits: ["00000000", "00001110", "00011000", "00111110", "00011000", "00011000", "00011000", "00000000"] },
      { address: 103, name: "g", bits: ["00000000", "00000000", "00111110", "01100110", "01100110", "00111110", "00000110", "01111100"] },
      { address: 104, name: "h", bits: ["00000000", "01100000", "01100000", "01111100", "01100110", "01100110", "01100110", "00000000"] },
      { address: 105, name: "i", bits: ["00000000", "00011000", "00000000", "00111000", "00011000", "00011000", "00111100", "00000000"] },
      { address: 106, name: "j", bits: ["00000000", "00000110", "00000000", "00000110", "00000110", "00000110", "00000110", "00111100"] },
      { address: 107, name: "k", bits: ["00000000", "01100000", "01100000", "01101100", "01111000", "01101100", "01100110", "00000000"] },
      { address: 108, name: "l", bits: ["00000000", "00111000", "00011000", "00011000", "00011000", "00011000", "00111100", "00000000"] },
      { address: 109, name: "m", bits: ["00000000", "00000000", "01100110", "01111111", "01111111", "01101011", "01100011", "00000000"] },
      { address: 110, name: "n", bits: ["00000000", "00000000", "01111100", "01100110", "01100110", "01100110", "01100110", "00000000"] },
      { address: 111, name: "o", bits: ["00000000", "00000000", "00111100", "01100110", "01100110", "01100110", "00111100", "00000000"] },
      { address: 112, name: "p", bits: ["00000000", "00000000", "01111100", "01100110", "01100110", "01111100", "01100000", "01100000"] },
      { address: 113, name: "q", bits: ["00000000", "00000000", "00111110", "01100110", "01100110", "00111110", "00000110", "00000110"] },
      { address: 114, name: "r", bits: ["00000000", "00000000", "01111100", "01100110", "01100000", "01100000", "01100000", "00000000"] },
      { address: 115, name: "s", bits: ["00000000", "00000000", "00111110", "01100000", "00111100", "00000110", "01111100", "00000000"] },
      { address: 116, name: "t", bits: ["00000000", "00011000", "01111110", "00011000", "00011000", "00011000", "00001110", "00000000"] },
      { address: 117, name: "u", bits: ["00000000", "00000000", "01100110", "01100110", "01100110", "01100110", "00111110", "00000000"] },
      { address: 118, name: "v", bits: ["00000000", "00000000", "01100110", "01100110", "01100110", "00111100", "00011000", "00000000"] },
      { address: 119, name: "w", bits: ["00000000", "00000000", "01100011", "01101011", "01111111", "00111110", "00110110", "00000000"] },
      { address: 120, name: "x", bits: ["00000000", "00000000", "01100110", "00111100", "00011000", "00111100", "01100110", "00000000"] },
      { address: 121, name: "y", bits: ["00000000", "00000000", "01100110", "01100110", "01100110", "00111110", "00001100", "01111000"] },
      { address: 122, name: "z", bits: ["00000000", "00000000", "01111110", "00001100", "00011000", "00110000", "01111110", "00000000"] },


    );



    this.Characters.push({
      address: 0, name: "", bits: [
        "00000000",
        "00000000",
        "00000000",
        "00000000",
        "00000000",
        "00000000",
        "00000000",
        "00000000"]
    });
  }



  public getCharacter(n: number) {
    return this.Characters.filter(x => x.address === n)[0];
  }


}
