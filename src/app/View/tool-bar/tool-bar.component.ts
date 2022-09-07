import { Component, OnInit } from '@angular/core';
import { ControllerService } from 'src/app/Controller/controller.service';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.css']
})
export class ToolBarComponent implements OnInit {
  file: String;

  constructor(private controllerService: ControllerService) { }

  ngOnInit(): void {
  }


  import(event: any){
    this.file = event.target.files[0];
    this.controllerService.import(this.file);
  }

  export(){
    this.controllerService.export();
  }
}