import { Component, OnInit } from '@angular/core';
import { GridViewControllerService } from 'src/app/Controller/grid-view-controller.service';

@Component({
  selector: 'app-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.scss']
})
export class GridViewComponent implements OnInit {
  areEditorsSwapped: boolean = false;

  constructor(
    private gridViewController: GridViewControllerService,
  ) { }

  ngOnInit(): void {
  }

  ngDoCheck(){
    if(this.gridViewController.getAreEditorsSwapped() !== this.areEditorsSwapped){
      this.areEditorsSwapped = !this.areEditorsSwapped;
    }
  }
}
