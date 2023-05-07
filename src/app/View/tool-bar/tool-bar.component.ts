import { Component, HostBinding, OnInit } from '@angular/core';
import { ControllerService } from 'src/app/Controller/controller.service';
import { MatDialog } from '@angular/material/dialog';
import { GettingStartedDialogComponent } from './getting-started-dialog/getting-started-dialog.component';
import { AboutDialogComponent } from './about-dialog/about-dialog.component';
import { GridViewControllerService } from 'src/app/Controller/grid-view-controller.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { FormControl } from '@angular/forms';
import { ThemeControlService } from 'src/app/Controller/theme-control.service';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.scss']
})
export class ToolBarComponent implements OnInit {
  file: String;
  isCheckedSwitchEditors: boolean = false;

  @HostBinding('class') className = '';

  constructor(
    private controllerService: ControllerService,
    private dialog: MatDialog,
    private gridViewController: GridViewControllerService,
    private themeControl: ThemeControlService,
  ) { }

  ngOnInit(): void { }

  ngDoCheck() {
    if (this.gridViewController.getAreEditorsSwapped() !== this.isCheckedSwitchEditors) {
      this.gridViewController.setAreEditorsSwapped(this.isCheckedSwitchEditors);
    }
  }

  importMacro(event: any) {
    this.file = event.target.files[0];
    this.controllerService.importMacro(this.file);
  }

  importMicro(event: any) {
    this.file = event.target.files[0];
    this.controllerService.importMicro(this.file);
  }

  exportMacro() {
    this.controllerService.exportMacro();
  }

  exportMicro() {
    this.controllerService.exportMicro();
  }

  openGettingStartedDialog() {
    const dialogRef = this.dialog.open(GettingStartedDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: $(result)`);
    });
  }

  openAboutDialog() {
    const dialogRef = this.dialog.open(AboutDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: $(result)`);
    });
  }

  public toggleTheme(event: MatSlideToggleChange) {
    this.themeControl.toggleTheme();
  }

}