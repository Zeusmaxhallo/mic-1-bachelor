import { Component, OnInit } from '@angular/core';
import { PresentationModeControllerService } from 'src/app/Presenter/presentation-mode-controller.service';
declare let anime: any;

@Component({
  selector: '[app-registers]',
  templateUrl: './registers.component.html',
  styleUrls: ['./registers.component.scss']
})
export class RegistersComponent implements OnInit {

  public presentationMode = false;

  constructor(
    private presentationModeController: PresentationModeControllerService
    ) {}
  ngOnInit(): void {
    this.presentationModeController.presentationMode$.subscribe( mode => {
      this.presentationMode = mode.presentationMode;
    })
  }


  public showValue(register: string, value: number){

    const registerElement = document.querySelector("." + register + "_Value");
    const oldValue = registerElement.innerHTML;

    registerElement.innerHTML = value.toString();


    //anime({
    //  targets: registerElement,
    //  innerHTML: [oldValue, value],
    //  easing: 'linear',
    //  round: 1,
    //  duration: Math.abs(parseInt(oldValue) - value) < 2 ? 1 : 300
    //});

  }


}
