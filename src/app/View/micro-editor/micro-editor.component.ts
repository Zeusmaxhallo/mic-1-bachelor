import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { MicroProviderService } from "src/app/Controller/micro-provider.service";
import { ControllerService } from "src/app/Controller/controller.service";

import * as ace from "ace-builds";


const LANG  = "ace/mode/mic1";
const THEME = "ace/theme/gruvbox";



@Component({
  selector: "app-micro-editor",
  templateUrl: "./micro-editor.component.html",
  styleUrls: ["./micro-editor.component.css"]
})
export class MicroEditorComponent implements AfterViewInit{

  @ViewChild("editor") private editor: ElementRef<HTMLElement>;
  content: string = "";
  private aceEditor:ace.Ace.Editor;
  file: string;
  constructor(private microProvider: MicroProviderService, private controllerService: ControllerService) { }

  import(event: any){
    this.file = event.target.files[0];
    this.controllerService.import(this.file);
  }

  exportMicro(){
    this.controllerService.exportMicro();
  }

  ngOnInit(): void {
    this.content = this.microProvider.getMicro();
  }

  ngAfterViewInit(): void {

    ace.config.set("basePath", "/assets/editor")

    const editorOptions: Partial<ace.Ace.EditorOptions> = {
      highlightActiveLine: true,
      minLines: 20,
      fontSize: 14,
      autoScrollEditorIntoView: true,
      useWorker: false,
      
    }

    // create Ace.Editor Object
    this.aceEditor = ace.edit(this.editor.nativeElement, editorOptions);

    this.aceEditor.session.setValue(this.content);
    this.aceEditor.setTheme(THEME);
    this.aceEditor.session.setMode(LANG);

    this.aceEditor.on("input", () =>{
      this.content = this.aceEditor.getValue();
      
      // Updates the macrocode on the macro provider
      this.microProvider.setMicro(this.content);
    })
  }

  refresh(){
    this.content = this.microProvider.getMicro();
    this.aceEditor.session.setValue(this.content);
  }
}