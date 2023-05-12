import { AfterViewInit, Component, ElementRef, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { MacroProviderService } from "src/app/Controller/macro-provider.service";
import { ControllerService } from "src/app/Controller/controller.service";
import * as ace from "ace-builds";
import { DirectorService } from "src/app/Controller/director.service";
import { timer } from "rxjs";
import { MacroParserService } from "src/app/Controller/macro-parser.service";
import { ThemeControlService } from "src/app/Controller/theme-control.service";
import { PresentationModeControllerService } from "src/app/Controller/presentation-mode-controller.service";


const LANG = "ace/mode/mic1";
const THEME_DARK = "ace/theme/gruvbox";
const THEME_LIGHT= "ace/theme/eclipse";

const editorOptions: Partial<ace.Ace.EditorOptions> = {
  highlightActiveLine: true,
  minLines: 20,
  fontSize: 14,
  autoScrollEditorIntoView: true,
  useWorker: false,
}

const editorOptionsPresentation: Partial<ace.Ace.EditorOptions> = {
  highlightActiveLine: true,
  minLines: 20,
  fontSize: 26,
  autoScrollEditorIntoView: true,
  useWorker: false,
}


@Component({
  selector: "app-editor",
  templateUrl: "./editor.component.html",
  styleUrls: ["./editor.component.scss"]
})


export class EditorComponent implements AfterViewInit {
  presentationMode: boolean = false;

  @ViewChild("editor") private editor: ElementRef<HTMLElement>;
  content: string = "";
  private aceEditor: ace.Ace.Editor;
  file: String;

  constructor(
    private macroProvider: MacroProviderService,
    private controllerService: ControllerService,
    private directorService: DirectorService,
    private macroParser: MacroParserService,
    private themeController: ThemeControlService,
    private presentationModeController: PresentationModeControllerService,
  ) { }

  ngOnInit(): void {
    this.content = this.macroProvider.getMacro();
  }

  ngAfterViewInit(): void {
    ace.config.set("basePath", "assets/editor");

    // create Ace.Editor Object
    this.aceEditor = ace.edit(this.editor.nativeElement, this.getOptions());

    this.aceEditor.session.setValue(this.content);
    this.aceEditor.setTheme(THEME_DARK);
    this.aceEditor.session.setMode(LANG);

    // update when Macrocode changes
    this.aceEditor.on("input", () => {
      this.content = this.aceEditor.getValue();

      // Updates the macrocode on the macro provider
      this.macroProvider.setMacro(this.content);
      this.removeErrorHighlighting();
    })


    // toggle Theme
    this.themeController.toggleThemeNotifier$.subscribe(
      lightMode => {
        if (lightMode) {
          this.aceEditor.setTheme(THEME_LIGHT)
        }else{
          this.aceEditor.setTheme(THEME_DARK)
        }
      }
    )

    // toggle Breakpoints
    let editor = this.aceEditor;

    let setBreakpoint = (line: number) => {
      let editorLineWithoutEmptyRows = this.macroProvider.getEditorLineWithoutEmptyRows(line);
      this.directorService.setMacroBreakpoint(editorLineWithoutEmptyRows + 1);
    }

    let clearBreakpoint = (line: number) => {
      this.directorService.clearMacroBreakpoint(line + 1);
    }

    this.aceEditor.on("guttermousedown", function (e) {
      let target = e.domEvent.target;

      if (target.className.indexOf("ace_gutter-cell") == -1) { return; }
      if (!editor.isFocused()) { return; }
      if (e.clientX > 25 + target.getBoundingClientRect().left) { return; }

      const row = e.getDocumentPosition().row;
      const breakpoints = e.editor.session.getBreakpoints(row, 0)

      // If there's a breakpoint already defined, it should be removed
      if (typeof breakpoints[row] === typeof undefined) {
        e.editor.session.setBreakpoint(row);
        setBreakpoint(row);
      } else {
        e.editor.session.clearBreakpoint(row);
        clearBreakpoint(row);
      }
      e.stop();
    });

    // flash an error message when an error occurs
    this.macroParser.errorFlasher$.subscribe(error => {
      if (error.error) {
        let editorErrorLine = this.macroProvider.getEditorLineWithParserLine(error.line);
        this.flashErrorMessage(error.error, editorErrorLine);
      }
    });

    // change editor options when Presentationmode is toggled
    this.presentationModeController.presentationMode$.subscribe(presentationMode => {
      if(presentationMode.presentationMode == true){
        this.aceEditor.setOptions(editorOptionsPresentation)
      }
      else{
        this.aceEditor.setOptions(editorOptions)
      }
    });

    // highlight line if we hit a breakpoint
    this.directorService.breakpointFlasherMacro$.subscribe(breakpoint => {
      if (breakpoint.line) {
        let editorBreakpointLine = this.macroProvider.getEditorLineWithParserLine(breakpoint.line);
        this.highlightBreakpoint(editorBreakpointLine)
        const source = timer(10000);
        source.subscribe(() => this.removeBreakpointHighlighting())
      }
    });
  }

  private highlightBreakpoint(line: number) {
    this.aceEditor.getSession().addMarker(new ace.Range(line - 1, 0, line, 0), "ace_breakpoint-line", "text");
    if (!this.aceEditor.isRowVisible(line)) {
      this.aceEditor.scrollToRow(line - 4);
    }
  }

  private flashErrorMessage(errorMessage: string, line: number) {
    this.aceEditor.getSession().setAnnotations(
      [{
        row: line - 1,
        column: 0,
        text: errorMessage,
        type: "error" // also "warning" and "information"
      }]
    );
    this.aceEditor.getSession().addMarker(new ace.Range(line - 1, 0, line, 0), "ace_error-line", "text");
    this.aceEditor.scrollToRow(line - 4);

  }

  ngDoCheck() {
    if (this.macroProvider.getMacro() !== this.content) {
      this.content = this.macroProvider.getMacro();
      this.removeErrorHighlighting();
      this.aceEditor.session.setValue(this.content);
      this.directorService.clearMacroBreakpoints();
      this.aceEditor.session.setValue(this.content);
    }
  }

  import(event: any) {
    this.file = event.target.files[0];
    this.controllerService.importMacro(this.file);
  }

  private removeErrorHighlighting() {
    // clear Markers / syntax Highlighting
    const prevMarkers = this.aceEditor.session.getMarkers();
    if (prevMarkers) {
      const prevMarkersArr: any = Object.keys(prevMarkers);
      for (let item of prevMarkersArr) {
        if (prevMarkers[item].clazz == "ace_error-line") {
          this.aceEditor.session.removeMarker(prevMarkers[item].id);
        }
      }
    }

    // clear annotation
    this.aceEditor.session.clearAnnotations();
  }

  private removeBreakpointHighlighting() {
    const prevMarkers = this.aceEditor.session.getMarkers();
    if (prevMarkers) {
      const prevMarkersArr: any = Object.keys(prevMarkers);
      for (let item of prevMarkersArr) {
        if (prevMarkers[item].clazz == "ace_breakpoint-line") {
          this.aceEditor.session.removeMarker(prevMarkers[item].id);
        }
      }
    }
  }

  exportMacro() {
    this.controllerService.exportMacro();
  }

  getOptions(){
    if(this.presentationModeController.getPresentationMode() == false){
      return editorOptions
    }
    else{
      return editorOptionsPresentation
    }
  }

}