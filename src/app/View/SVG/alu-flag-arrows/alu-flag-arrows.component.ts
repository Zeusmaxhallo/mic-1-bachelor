import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { DirectorService } from 'src/app/Presenter/director.service';
import { PresentationModeControllerService } from 'src/app/Presenter/presentation-mode-controller.service';


@Component({
  selector: '[app-alu-flag-arrows]',
  templateUrl: './alu-flag-arrows.component.html',
  styleUrls: ['./alu-flag-arrows.component.scss']
})
export class AluFlagArrowsComponent implements AfterViewInit {
  @ViewChild("nArrow") nArrow: ElementRef;

  public zFlag = false;
  public nFlag = false;

  public presentationMode = false;

  constructor(
    private director: DirectorService,
    private presentationModeController: PresentationModeControllerService,
  ) { }

  ngAfterViewInit(): void {
    this.director.aluFlags$.subscribe(flags => {
      this.zFlag = flags.Z;
      this.nFlag = flags.N;

      const zRegister = document.querySelector(".Z_Value");
      zRegister.innerHTML = this.zFlag ? "1" : "0";

      const nRegister = document.querySelector(".N_Value");
      nRegister.innerHTML = this.nFlag ? "1" : "0";

    });


    this.presentationModeController.presentationMode$.subscribe( mode => {
      this.presentationMode = mode.presentationMode;
    })
  }

}
