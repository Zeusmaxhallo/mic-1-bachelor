import { AfterViewInit, Component, ElementRef, ViewChild, ɵɵqueryRefresh } from "@angular/core";
import { MicroProviderService } from "src/app/Controller/micro-provider.service";
import { ControllerService } from "src/app/Controller/controller.service";

import * as ace from "ace-builds";
import { DirectorService } from "src/app/Controller/director.service";


const LANG  = "ace/mode/micro";
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

  
  constructor(
    private microProvider: MicroProviderService, 
    private controllerService: ControllerService,
    private directorService: DirectorService) { }


  ngOnInit(): void {
    this.content = this.microProvider.getMicro();
  }

  ngAfterViewInit(): void {

    ace.config.set("basePath", "assets/editor")

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
      
      // Updates the microcode on the micro provider
      this.microProvider.setMicro(this.content);
      this.removeErrorHighlighting();
    })

    // flash an error message when an error occurs
    this.directorService.errorFlasher$.subscribe( error =>{
      if(error.error){
        this.flashErrorMessage(error.error, error.line);
      }
    })
  }

  flashErrorMessage(errorMessage: string, line: number){
    this.aceEditor.getSession().setAnnotations(
      [{
        row: line - 1,
        column: 0, 
        text: errorMessage, 
        type: "error" // also "warning" and "information"
      }]
    );
    this.aceEditor.getSession().addMarker(new ace.Range(line-1, 0, line , 0), "ace_error-line", "text");
    this.aceEditor.scrollToRow(line - 4);

  }

  ngDoCheck(){
    if(this.microProvider.getMicro() !== this.content){
      this.content = this.microProvider.getMicro();
      this.removeErrorHighlighting();    
      this.aceEditor.session.setValue(this.content);  
    }
  }

  import(event: any){
    this.file = event.target.files[0];
    this.controllerService.importMicro(this.file);
  }

  private removeErrorHighlighting(){
    // clear Markers / syntax Highlighting
    const prevMarkers = this.aceEditor.session.getMarkers();
    console.log(prevMarkers[3])
    if (prevMarkers){
      const prevMarkersArr:any = Object.keys(prevMarkers);
      for (let item of prevMarkersArr) {
        if(prevMarkers[item].clazz == "ace_error-line"){
          this.aceEditor.session.removeMarker(prevMarkers[item].id);
        }
      }
    }

    // clear annotation
    this.aceEditor.session.clearAnnotations();
  }
}