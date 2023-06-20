import { Component, OnInit } from '@angular/core';
import { MainMemoryService } from 'src/app/Controller/Emulator/main-memory.service';
import { MacroParserService } from 'src/app/Controller/macro-parser.service';
import { PresentationModeControllerService } from 'src/app/Controller/presentation-mode-controller.service';

@Component({
  selector: 'app-memory-view',
  templateUrl: './memory-view.component.html',
  styleUrls: ['./memory-view.component.css']
})
export class MemoryViewComponent implements OnInit {
  public memory: { [key: number]: number } = {};
  public memoryArr: {address: string, value: number}[] = []
  public headers = ["address", "value"]

  public fontSize: string = "medium";
  public presentationMode: boolean;

  constructor(
    private mainMemory: MainMemoryService,
    private macroParser: MacroParserService,
    private presentationModeController: PresentationModeControllerService,
    ) { }

  ngOnInit(): void {
    this.presentationModeController.presentationMode$.subscribe(b => {
      if(b.presentationMode === true){
        this.presentationMode = true;
      }
      else{
        this.presentationMode = false;
      }
    })

    this.macroParser.memoryViewRefresher$.subscribe( result => {
      if(result){
        this.refreshMemoryView();
      }
    })
  }

  refreshMemoryView(){
    this.memory = this.mainMemory.getMemory();

    let i = 0;
    while(this.memory[i] !== undefined){
      this.memoryArr.push({address: "0x" + i.toString(16), value: this.memory[i]});
      i++;
    }
  }

}
