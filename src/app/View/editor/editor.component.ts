import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";

import * as ace from "ace-builds";
import { MacroProviderService } from "src/app/Controller/macro-provider.service";

@Component({
  selector: "app-editor",
  templateUrl: "./editor.component.html",
  styleUrls: ["./editor.component.css"]
})
export class EditorComponent implements AfterViewInit{

  constructor(private macroProvider: MacroProviderService) { }

  content: string = "";

  @ViewChild("editor") private editor: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {

    ace.config.set("fontSize", "14px");
    ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.4.12/src-noconflict');

    const aceEditor = ace.edit(this.editor.nativeElement);
    aceEditor.session.setValue(this.content);

    aceEditor.setTheme("ace/theme/gruvbox");
    aceEditor.session.setMode('ace/mode/javascript');

    aceEditor.on("change", () =>{
      this.content = aceEditor.getValue();
      
      //Updates the macrocode on the macro provider
      this.macroProvider.setMacro(this.content);
    })
  }

  refresh(){
    this.content = this.macroProvider.getMacro();
    const aceEditor = ace.edit(this.editor.nativeElement);
    aceEditor.session.setValue(this.macroProvider.getMacro());
  }
}