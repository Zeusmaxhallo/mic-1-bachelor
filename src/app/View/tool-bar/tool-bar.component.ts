import { Component, OnInit } from '@angular/core';
import { ControllerService } from 'src/app/Controller/controller.service';
import { DirectorService } from 'src/app/Controller/director.service';
import { ControlStoreService } from 'src/app/Controller/Emulator/control-store.service';
import { MacroParserService } from 'src/app/Controller/macro-parser.service';
import { MicroProviderService } from 'src/app/Controller/micro-provider.service';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.css']
})
export class ToolBarComponent implements OnInit {
  file: String;

  constructor(
    private controllerService: ControllerService,
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

}