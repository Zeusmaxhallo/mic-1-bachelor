import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MainMemoryService } from 'src/app/Model/Emulator/main-memory.service';
import { MacroParserService } from 'src/app/Model/macro-parser.service';
import { RegProviderService } from 'src/app/Model/reg-provider.service';
import { PresentationControllerService } from 'src/app/Presenter/presentation-controller.service';
import { ThemeControlService } from 'src/app/Presenter/theme-control.service';

/**
 * MemoryField Nodes
 * Each node has a name and an optional list of children.
 */
interface MemoryField {
  name: string;
  children?: MemoryField[];
  address?: number;
}

/** Flat node with expandable and level information */
interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

const MEMORY_FIELD:MemoryField[] = [
  {
    name: 'MethodArea',
    children: [],
  },
  {
    name: 'ConstantPool',
    children: [],
  },
  {
    name: "General Memory",
    children:[]
  }
];

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
  public lightMode = false;

  private memoryFields:MemoryField[] = MEMORY_FIELD;

  constructor(
    private mainMemory: MainMemoryService,
    private macroParser: MacroParserService,
    private presentationController: PresentationControllerService,
    private regProvider: RegProviderService,
    private themeController: ThemeControlService
    ) {
      this.dataSource.data = this.memoryFields;
     }

  ngOnInit(): void {
    this.presentationController.presentationMode$.subscribe(b => {
      this.presentationMode = b.presentationMode;
    })

    this.macroParser.memoryViewRefresher$.subscribe( result => {
      if(result){
        this.init();
      }
    })

    this.mainMemory.memoryUpdate$.subscribe( entry => {
      this.refreshMemoryView(entry.address, entry.value);
    })

    this.themeController.toggleThemeNotifier$.subscribe(
      lightMode => {
        lightMode? this.lightMode = true : this.lightMode = false;
      }
    )
  }

  private init(){

    // reset Fields
    this.memoryFields = MEMORY_FIELD;

    // set MethodArea
    let entries = [];

    for (let i = 0; i < this.mainMemory.methodAreaSize; i++) {
      entries.push( {name: this.mainMemory.dec2hex(i) + " " + this.mainMemory.get_8(i,true), address: i});
    }
    this.memoryFields[0].children = entries;


    // set ConstantPool
    entries = [];
    let start = this.regProvider.getRegister("CPP").getValue() * 4;
    for (let i = start; i < start + this.mainMemory.constantPoolSize; i += 4) {
      entries.push( {name: this.mainMemory.dec2hex(i) + " " + this.mainMemory.get_32(i), address: i});
    }
    this.memoryFields[1].children = entries;

    // set GeneralArea
    entries = [];
    start = this.regProvider.getRegister("CPP").getValue() * 4 + this.mainMemory.constantPoolSize;
    const keys = Object.keys(this.mainMemory.getMemory()).filter(address => parseInt(address) >= start).sort();
    for (let i = 0; i < keys.length; i += 4) {
      entries.push( {name: this.mainMemory.dec2hex(parseInt(keys[i])) + " " + this.mainMemory.get_32(parseInt(keys[i])), address: i});
    }
    this.memoryFields[2].children = entries;

    this.dataSource.data = this.memoryFields;
  }

  private refreshMemoryView(address:number, value: number){
    this.memoryFields = this.dataSource.data;
    const updatedEntry = {name: this.mainMemory.dec2hex(address) + " " + value, address: address};

    // update the changed entry in the View
    let index = this.memoryFields[2].children.findIndex(x => x.address === address);
    if (index === -1){
      this.memoryFields[2].children.push(updatedEntry);
    }else{
      this.memoryFields[2].children[index] =  updatedEntry;
    }


    this.dataSource.data = this.memoryFields;

  }






  // Stuff for the Tree:
  private _transformer = (node: MemoryField, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: FlatNode) => node.expandable;


}
