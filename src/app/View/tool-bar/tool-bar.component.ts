import { Component, OnInit } from '@angular/core';
import { ControllerService } from 'src/app/Controller/controller.service';
import { MatDialog, MatDialogContent } from '@angular/material/dialog';
import { GettingStartedDialogComponent } from './getting-started-dialog/getting-started-dialog.component';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.css']
})
export class ToolBarComponent implements OnInit {
  file: String;

  constructor(
    private controllerService: ControllerService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  importMacro(event: any){
    this.file = event.target.files[0];
    this.controllerService.importMacro(this.file);
  }

  importMicro(event: any){
    this.file = event.target.files[0];
    this.controllerService.importMicro(this.file);
  }

  exportMacro(){
    this.controllerService.exportMacro();
  }

  exportMicro(){
    this.controllerService.exportMicro();
  }

  openGettingStartedDialog(){
    const dialogRef = this.dialog.open(GettingStartedDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: $(result)`);
    });
  }

}