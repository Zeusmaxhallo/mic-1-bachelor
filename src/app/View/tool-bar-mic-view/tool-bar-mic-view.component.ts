import { Component, OnInit } from '@angular/core';
import { DirectorService } from 'src/app/Controller/director.service';
import { ControlStoreService } from 'src/app/Controller/Emulator/control-store.service';
import { MainMemoryService } from 'src/app/Controller/Emulator/main-memory.service';
import { MacroParserService } from 'src/app/Controller/macro-parser.service';
import { MacroProviderService } from 'src/app/Controller/macro-provider.service';
import { MacroTokenizerService } from 'src/app/Controller/macro-tokenizer.service';
import { MicroProviderService } from 'src/app/Controller/micro-provider.service';

@Component({
  selector: 'app-tool-bar-mic-view',
  templateUrl: './tool-bar-mic-view.component.html',
  styleUrls: ['./tool-bar-mic-view.component.scss']
})
export class ToolBarMicViewComponent implements OnInit {

  animate = true;
  animationSpeed = 2;

  disableRunButton = true;
  disableStepButton = true;

  constructor(
    private memory: MainMemoryService,
    private controlStore: ControlStoreService,
    private director: DirectorService,
    private macroTokenizer: MacroTokenizerService,
    private macroParser: MacroParserService,
    private macroProvider: MacroProviderService,
    private microProvider: MicroProviderService,
  ) {}

  ngOnInit(): void {
    this.director.animationEnabled = this.animate;
    
    this.director.finishedRun$.subscribe( result => {
      result ? this.enableRunButtons() : this.disableRunButtons();
    })

    this.director.errorFlasher$.subscribe( error=> {
      error.error ? this.disableRunButtons() : "";
    })
  }

  step(){
    if(this.macroProvider.getMacroGotChanged() || this.microProvider.getMicroGotChanged()){
      this.controlStore.loadMicro();
      this.macroTokenizer.init(); 
      this.macroParser.parse();
      this.director.reset();
    }
    this.disableRunButtons();

    this.director.init();
    this.director.step();

    this.macroProvider.isLoaded();
    this.microProvider.isLoaded();
  }

  stepMacro(){
    if(this.macroProvider.getMacroGotChanged() || this.microProvider.getMicroGotChanged()){
      this.controlStore.loadMicro();
      this.macroTokenizer.init(); 
      this.macroParser.parse();
      this.director.reset();
    }

    this.director.init();
    this.director.runMacroInstruction();

    this.macroProvider.isLoaded();
    this.microProvider.isLoaded();
  }

  reset(){
    this.director.reset();

    // step through INVOKEVIRUAL for main method
    this.stepMacro();
  }

  private enableRunButtons(){
    this.disableRunButton = false;
    this.disableStepButton = false;
  }

  private disableRunButtons(){
    this.disableRunButton = true;
    this.disableStepButton = true;
  }



  run(){
    if(this.macroProvider.getMacroGotChanged() || this.microProvider.getMicroGotChanged()){
      this.controlStore.loadMicro();
      this.macroTokenizer.init(); 
      this.macroParser.parse();
      this.director.reset();
    }

    this.disableRunButtons();
    this.director.run();

    this.macroProvider.isLoaded();
    this.microProvider.isLoaded();
  }


  changeAnimSpeed(event:any){
    this.animationSpeed = event.value;
    this.director.animationSpeed = this.animationSpeed;

  }

  toggleAnimVisibility(){
    this.director.animationEnabled = this.animate;
  }

}
