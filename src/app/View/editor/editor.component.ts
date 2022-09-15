import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";

import * as ace from "ace-builds";
import { MacroProviderService } from "src/app/Controller/macro-provider.service";

@Component({
  selector: "app-editor",
  templateUrl: "./editor.component.html",
  styleUrls: ["./editor.component.css"]
})
export class EditorComponent implements AfterViewInit{

  @ViewChild("editor") private editor: ElementRef<HTMLElement>;
  content: string = "";
  private aceEditor:ace.Ace.Editor;

  constructor(private macroProvider: MacroProviderService) { }

  ngOnInit(): void {
    this.content = this.macroProvider.getMacro();
  }

  ngAfterViewInit(): void {

    ace.config.set("fontSize", "14px");
    ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');

    // create Ace.Editor Object
    this.aceEditor = ace.edit(this.editor.nativeElement);

    this.aceEditor.session.setValue(this.content);
    this.aceEditor.setTheme("ace/theme/gruvbox");
    this.aceEditor.session.setMode('ace/mode/javascript');

    this.aceEditor.on("input", () =>{
      this.content = this.aceEditor.getValue();
      
      // Updates the macrocode on the macro provider
      this.macroProvider.setMacro(this.content);
    })
  }

  refresh(){
    this.content = this.macroProvider.getMacro();
    this.aceEditor.session.setValue(this.content);
  }
}