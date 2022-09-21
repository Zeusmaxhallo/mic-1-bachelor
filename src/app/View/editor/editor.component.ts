import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { MacroProviderService } from "src/app/Controller/macro-provider.service";
import { ControllerService } from "src/app/Controller/controller.service";
import * as ace from "ace-builds";


const LANG  = "ace/mode/mic1";
const THEME = "ace/theme/gruvbox";



@Component({
  selector: "app-editor",
  templateUrl: "./editor.component.html",
  styleUrls: ["./editor.component.css"]
})
export class EditorComponent implements AfterViewInit{

  @ViewChild("editor") private editor: ElementRef<HTMLElement>;
  content: string = "";
  private aceEditor:ace.Ace.Editor;
  file: String; 
  
  constructor(private macroProvider: MacroProviderService, private controllerService: ControllerService) { }

  import(event: any){
    this.file = event.target.files[0];
    this.controllerService.import(this.file);
  }

  exportMacro(){
    this.controllerService.exportMacro();
  }
  
  ngOnInit(): void {
    this.content = this.macroProvider.getMacro();
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
    })
  }

  refresh(){
    this.content = this.macroProvider.getMacro();
    this.aceEditor.session.setValue(this.content);
  }

  // Updates the macrocode on the macro provider and starts interpretation
  load(){
    this.macroProvider.setMacro(this.content);
  }
}