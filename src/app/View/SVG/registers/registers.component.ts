import { Component, OnInit } from '@angular/core';
declare let anime: any;

@Component({
  selector: '[app-registers]',
  templateUrl: './registers.component.html',
  styleUrls: ['./registers.component.scss']
})
export class RegistersComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }


  public showValue(register: string, value: number){

    const registerElement = document.querySelector("." + register + "_Value");
    const oldValue = registerElement.innerHTML;
    

    anime({
      targets: registerElement,
      innerHTML: [oldValue, value],
      easing: 'linear',
      round: 1, 
      duration: Math.abs(parseInt(oldValue) - value) < 2 ? 1 : 300
    });

  }


}
