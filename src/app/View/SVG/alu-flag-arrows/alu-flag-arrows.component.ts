import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { DirectorService } from 'src/app/Controller/director.service';


@Component({
  selector: '[app-alu-flag-arrows]',
  templateUrl: './alu-flag-arrows.component.html',
  styleUrls: ['./alu-flag-arrows.component.scss']
})
export class AluFlagArrowsComponent implements AfterViewInit {
  @ViewChild("nArrow") nArrow: ElementRef;

  public zFlag = false;
  public nFlag = false;

  constructor(
    private director: DirectorService,
  ) { }

  ngAfterViewInit(): void {
    this.director.aluFlags$.subscribe(flags => {
      this.zFlag = flags.Z;
      this.nFlag = flags.N;
    })
  }

}
