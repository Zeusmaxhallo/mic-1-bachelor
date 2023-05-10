import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DirectorService } from 'src/app/Controller/director.service';
import { MacroParserService } from 'src/app/Controller/macro-parser.service';


interface Line {
  type: string;
  content: string;
}

@Component({
  selector: 'app-debug-console',
  templateUrl: './debug-console.component.html',
  styleUrls: ['./debug-console.component.scss']
})
export class DebugConsoleComponent implements OnInit, AfterViewChecked {
  @ViewChild("log") private log: ElementRef;

  constructor(
    private director: DirectorService,
    private macroParser: MacroParserService,
  ) { }

  ngOnInit(): void {

    // log Micro Errors
    this.director.errorFlasher$.subscribe(
      error => {
        if (!error.error) { return };
        let content = "microcode:" + error.line + "\t->\t" + error.error;
        if (error.line == 1000){ content = "macrocode" + "\t -> \t" + error.error; }
        this.content.push({ type: "error", content: content });
      }
    )

    // log MacroErrors
    this.macroParser.errorFlasher$.subscribe(
      error => {
        if (!error.error) { return };
        let content = "macrocode:" + error.line + "\t->\t" + error.error;
        this.content.push({ type: "error", content: content });
      }
    )

    // log Breakpoints
    this.director.breakpointFlasher$.subscribe(
      breakpoint => {
        if (!breakpoint.line) { return };
        this.content.push({ type: "info", content: "microcode \t->\t Hit Breakpoint in line " + breakpoint.line })
      }
    )

    /*
    this.director.breakpointFlasherMacro$.subscribe(
      breakpoint => {
        if (!breakpoint.line) { return };
        this.content.push({type: "info", content: "macrocode \t->\t Hit Breakpoint in line " + breakpoint.line})
      }
    )
    */

    // log reset Event
    this.director.consoleNotifier$.subscribe(
      content => {
        if (!content) { return };
        this.content.push({type: "success", content: content })
      }
    )


  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  public content: Line[] = [];


  private scrollToBottom() {
    try {
      this.log.nativeElement.scrollTop = this.log.nativeElement.scrollHeight;
    } catch (err) { }
  }


}
