import { Component, OnInit } from '@angular/core';
import { GridViewControllerService } from 'src/app/Presenter/grid-view-controller.service';

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
    this.gridViewController.switchEditors$.subscribe(
      content => {
        if(content.switchEditors === true){
          this.areEditorsSwapped = true;
        }
        else{
          this.areEditorsSwapped = false;
        }
      }
    )
  }

}
