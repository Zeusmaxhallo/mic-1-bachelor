import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { MacroProviderService } from '../Model/macro-provider.service';
import { MicroProviderService } from '../Model/micro-provider.service';
import { ControlStoreService } from '../Model/Emulator/control-store.service';
import { MacroTokenizerService } from '../Model/macro-tokenizer.service';
import { MacroParserService } from '../Model/macro-parser.service';
import { DirectorService } from './director.service';
import { BehaviorSubject } from 'rxjs';
import { MainMemoryService } from '../Model/Emulator/main-memory.service';


const code1: string = `.constant
cursor 65536
screenWidth 40          // 320 pixel / 8
vram 1073677824         // 0xFFFC1800 / 4
bitmaskZright -65536    // 0xFFFF0000 
bitmaskZleft 65535      // 0x0000FFFF
changeMode 1073677823   // 0xFFFC17FC / 4

  .string
      hallo "Hallo Welt!\\n"
      
  .end-string
.end-constant

.main
  LDC_W hallo
  DUP
  INVOKEVIRTUAL print

  
.end-main

.method print(pointer)
  loop: ILOAD pointer
  PEEK
  DUP
  
  // Check if we reached end of String
  IFEQ null 
  DUP 
  INVOKEVIRTUAL printChar
  IINC pointer 1
  GOTO loop
  
  // return success
  null: BIPUSH 0
  IRETURN

.end-method

.method printChar(char)

  // check for Enter (LF)
  ILOAD char
  BIPUSH 10 // 10 = LF
  IF_ICMPEQ lf
  
  // get cursor Position
  LDC_W cursor
  PEEK
  DUP
  
  // check if cursor is even or odd
  BIPUSH 1
  IAND
  IFEQ even // even for left char odd for right char in Word
  
  // if Cursor is odd change right Char in Word
  odd: SHIFT_R // divide cursor by two
  
      // add cursor to VRAM start Address
      LDC_W vram
      IADD
      DUP
      
      // load old left character and remove 16 lower bits
      PEEK
      LDC_W bitmaskZright
      IAND
      
      
      // load right character
      ILOAD char
      SHIFT_L
      BIPUSH 0x0F
      IOR
      IOR
      
      POKE // write characters
      
      GOTO inc
  
 // if cursor is even change left Char in Word
 even: SHIFT_R // divide Cursor by two
      
      // add cursor to VRAM start Address
      LDC_W vram
      IADD
      DUP
      
      // load old right character and remove 16 upper bits
      PEEK
      LDC_W bitmaskZleft
      IAND
      
      // load left character
      ILOAD char
      SHIFT_L
      BIPUSH 0x0F
      IOR
      SHIFT_L
      SHIFT_L
      IOR
      
      POKE // write characters
  
  // increment cursor position
  inc: LDC_W cursor
      DUP
      PEEK
      BIPUSH 1
      IADD
      POKE
  
  NOP // make Char visible 
  
  // return with Success -> 0
  BIPUSH 0
  IRETURN
  
  // handle Enter
  lf: LDC_W cursor
      PEEK
      DUP
      DUP
      LDC_W screenWidth
      
      // calc how deep cursor is in line
      INVOKEVIRTUAL modulo
      
      // subtract distance from cursorPos 
      // to find start of line
      ISUB
      
      // add screen width to start of line
      LDC_W screenWidth
      IADD
      
      // update cursor
      LDC_W cursor
      SWAP
      POKE
  
  // return with Success -> 0
  BIPUSH 0
  IRETURN
  
.end-method


.method modulo(x, y)
loop: ILOAD x
ILOAD y

// x - y
ISUB
DUP 
ISTORE x

// loop if result > y
ILOAD y
ISUB
IFLT checkSign
GOTO loop

// check if result is negative
checkSign: ILOAD x
IFLT turnSign
GOTO end

// if sign is negative -> y - result
turnSign: ILOAD y
ILOAD x
  IADD
ISTORE x

end: ILOAD x
IRETURN
.end-method`;

const code2: string = `.constant
cursor 65536
screenWidth 40          // 320 pixel / 8
  vram 1073677824         // 0xFFFC1800 / 4
bitmaskZright -65536    // 0xFFFF0000 
bitmaskZleft 65535      // 0x0
mode 64001
rightBall 520626175 // 0x1f081fff darkgray|white
leftBall 536813320  // 0x1fff1f08 white|darkgray
start 1073677944
end 1073677963

.end-constant


.main
  BIPUSH 120
  DUP
  INVOKEVIRTUAL ball
.end-main



.method ball(pos)

ILOAD pos
LDC_W vram
IADD
ISTORE pos


  // left to black
right:       ILOAD pos
  BIPUSH 0
  POKE
  
  IINC pos 1
  
  // right to color
  ILOAD pos
  LDC_W rightBall
  POKE
  
  NOP
  
  LDC_W end
  ILOAD pos
  IF_ICMPEQ left
  
  
  GOTO right
  
  
  // right to black
left: ILOAD pos
  BIPUSH 0
  POKE
  
  IINC pos -1
  
  // left to color
  ILOAD pos
  LDC_W leftBall
  POKE
  
  NOP
  
  LDC_W start
  ILOAD pos
  IF_ICMPEQ right
  
  GOTO left

.end-method





.method print(pointer)
  loop: ILOAD pointer
      PEEK
      DUP
      
      IFEQ null 
      
      DUP 
      INVOKEVIRTUAL printChar
      
      IINC pointer 1
      GOTO loop
  // return success
  null: BIPUSH 0
  IRETURN
.end-method

.method printChar(char)

  // check for Enter (LF)
  ILOAD char
  BIPUSH 10 // 10 = LF
  IF_ICMPEQ lf
  
  // get cursor Position
  LDC_W cursor
  PEEK
  DUP
  
  // check if cursor is even or odd
  BIPUSH 1
  IAND
  IFEQ even // even for left char odd for right char in Word
  
  // if Cursor is odd change right Char in Word
  odd: SHIFT_R // divide cursor by two
  
      // add cursor to VRAM start Address
      LDC_W vram
      IADD
      DUP
      
      // load old left character and remove 16 lower bits
      PEEK
      LDC_W bitmaskZright
      IAND
      
      
      // load right character
      ILOAD char
      SHIFT_L
      BIPUSH 0x0F
      IOR
      IOR
      
      POKE // write characters
      
      GOTO inc
  
 // if cursor is even change left Char in Word
 even: SHIFT_R // divide Cursor by two
      
      // add cursor to VRAM start Address
      LDC_W vram
      IADD
      DUP
      
      // load old right character and remove 16 upper bits
      PEEK
      LDC_W bitmaskZleft
      IAND
      
      // load left character
      ILOAD char
      SHIFT_L
      BIPUSH 0x0F
      IOR
      SHIFT_L
      SHIFT_L
      IOR
      
      POKE // write characters
  
  // increment cursor position
  inc: LDC_W cursor
      DUP
      PEEK
      BIPUSH 1
      IADD
      POKE
  
  //NOP // make Char visible 
  
  // return with Success -> 0
  BIPUSH 0
  IRETURN
  
  // handle Enter
  lf: LDC_W cursor
      PEEK
      DUP
      DUP
      LDC_W screenWidth
      
      // calc how deep cursor is in line
      INVOKEVIRTUAL modulo
      
      // subtract distance from cursorPos 
      // to find start of line
      ISUB
      
      // add screen width to start of line
      LDC_W screenWidth
      IADD
      
      // update cursor
      LDC_W cursor
      SWAP
      POKE
  
  // return with Success -> 0
  BIPUSH 0
  IRETURN
  
.end-method


.method modulo(x, y)
loop: ILOAD x
ILOAD y

// x - y
ISUB
DUP 
ISTORE x

// loop if result > y
ILOAD y
ISUB
IFLT checkSign
GOTO loop

// check if result is negative
checkSign: ILOAD x
IFLT turnSign
GOTO end

// if sign is negative -> y - result
turnSign: ILOAD y
ILOAD x
  IADD
ISTORE x

end: ILOAD x
IRETURN
.end-method`;

const code3: string = `.constant
cursor 65536
screenWidth 40          // 320 pixel / 8
vram 1073677824         // 0xFFFC1800 / 4
bitmaskZright -65536    // 0xFFFF0000 
bitmaskZleft 65535      // 0x0
mode 64001
rightBall 520626175 // 0x1f081fff darkgray|white
leftBall 536813320  // 0x1fff1f08 white|darkgray
start 1073677944
end 1073677963

.string
    pong "!PONG!"
.end-string

.end-constant


.main

LDC_W cursor
BIPUSH 54
POKE


// Text
    BIPUSH 31
    DUP
    INVOKEVIRTUAL printChar
    BIPUSH 31
    INVOKEVIRTUAL printChar
    BIPUSH 31
    INVOKEVIRTUAL printChar
    
    LDC_W pong
    INVOKEVIRTUAL print
    
    BIPUSH 31
    INVOKEVIRTUAL printChar
    BIPUSH 31
    INVOKEVIRTUAL printChar
    BIPUSH 31
    INVOKEVIRTUAL printChar
    
    


    BIPUSH 120
    INVOKEVIRTUAL ball
.end-main



.method ball(pos)

ILOAD pos
LDC_W vram
IADD
ISTORE pos


  // left to black
right:       ILOAD pos
  BIPUSH 0
  POKE
  
  IINC pos 1
  
  // right to color
  ILOAD pos
  LDC_W rightBall
  POKE
  
  NOP
  
  LDC_W end
  ILOAD pos
  IF_ICMPEQ left
  
  
  GOTO right
  
  
  // right to black
left: ILOAD pos
  BIPUSH 0
  POKE
  
  IINC pos -1
  
  // left to color
  ILOAD pos
  LDC_W leftBall
  POKE
  
  NOP
  
  LDC_W start
  ILOAD pos
  IF_ICMPEQ right
  
  GOTO left

.end-method





.method print(pointer)
  loop: ILOAD pointer
      PEEK
      DUP
      
      IFEQ null 
      
      DUP 
      INVOKEVIRTUAL printChar
      
      IINC pointer 1
      GOTO loop
  // return success
  null: BIPUSH 0
  IRETURN
.end-method

.method printChar(char)

  // check for Enter (LF)
  ILOAD char
  BIPUSH 10 // 10 = LF
  IF_ICMPEQ lf
  
  // get cursor Position
  LDC_W cursor
  PEEK
  DUP
  
  // check if cursor is even or odd
  BIPUSH 1
  IAND
  IFEQ even // even for left char odd for right char in Word
  
  // if Cursor is odd change right Char in Word
  odd: SHIFT_R // divide cursor by two
  
      // add cursor to VRAM start Address
      LDC_W vram
      IADD
      DUP
      
      // load old left character and remove 16 lower bits
      PEEK
      LDC_W bitmaskZright
      IAND
      
      
      // load right character
      ILOAD char
      SHIFT_L
      BIPUSH 0x0F
      IOR
      IOR
      
      POKE // write characters
      
      GOTO inc
  
 // if cursor is even change left Char in Word
 even: SHIFT_R // divide Cursor by two
      
      // add cursor to VRAM start Address
      LDC_W vram
      IADD
      DUP
      
      // load old right character and remove 16 upper bits
      PEEK
      LDC_W bitmaskZleft
      IAND
      
      // load left character
      ILOAD char
      SHIFT_L
      BIPUSH 0x0F
      IOR
      SHIFT_L
      SHIFT_L
      IOR
      
      POKE // write characters
  
  // increment cursor position
  inc: LDC_W cursor
      DUP
      PEEK
      BIPUSH 1
      IADD
      POKE
  
  //NOP // make Char visible 
  
  // return with Success -> 0
  BIPUSH 0
  IRETURN
  
  // handle Enter
  lf: LDC_W cursor
      PEEK
      DUP
      DUP
      LDC_W screenWidth
      
      // calc how deep cursor is in line
      INVOKEVIRTUAL modulo
      
      // subtract distance from cursorPos 
      // to find start of line
      ISUB
      
      // add screen width to start of line
      LDC_W screenWidth
      IADD
      
      // update cursor
      LDC_W cursor
      SWAP
      POKE
  
  // return with Success -> 0
  BIPUSH 0
  IRETURN
  
.end-method


.method modulo(x, y)
loop: ILOAD x
ILOAD y

// x - y
ISUB
DUP 
ISTORE x

// loop if result > y
ILOAD y
ISUB
IFLT checkSign
GOTO loop

// check if result is negative
checkSign: ILOAD x
IFLT turnSign
GOTO end

// if sign is negative -> y - result
turnSign: ILOAD y
ILOAD x
  IADD
ISTORE x

end: ILOAD x
IRETURN
.end-method`;

const microCode: string = `Main1: PC=PC+1; fetch; goto(MBR)

(0x00)NOP:; goto Main1

(0x10)BIPUSH: SP=MAR=SP+1;
    PC=PC+1; fetch
    MDR=TOS=MBR; wr; goto Main1;

(0x13)ISUB: MAR=SP=SP-1; rd
    H=TOS
    MDR=TOS=MDR-H; wr; goto Main1

(0x16)IAND: MAR=SP=SP-1; rd
    H=TOS
    MDR=TOS=MDR AND H; wr; goto Main1

(0x02)IOR:MAR=SP=SP-1; rd
    H=TOS
    MDR=TOS=MDR OR H; wr; goto Main1

(0x05)DUP: MAR = SP = SP+1
    MDR=TOS;wr;goto Main1

(0x57)POP: MAR=SP=SP-1; rd;
    pop1:   //wait
    TOS=MDR;goto Main1

(0x19)SWAP: MAR=SP-1; rd;
    MAR=SP
    H=MDR;wr
    MDR=TOS
    MAR=SP-1; wr
    TOS=H; goto Main1

(0x0D)IADD: MAR=SP=SP-1; rd
    H=TOS
    MDR=TOS=MDR+H; wr; goto Main1

(0x1F)ILOAD:H=LV;
    MAR=MBRU+H;rd;
    iload3: MAR=SP=SP+1;
    PC=PC+1; fetch; wr;
    TOS=MDR; goto Main1

(0x24)ISTORE: H=LV
    MAR=MBRU+H
    istore3: MDR=TOS;wr;
    SP=MAR=SP-1;rd
    PC=PC+1;fetch
    TOS=MDR; goto Main1

(0x2A)WIDE: PC=PC+1; fetch; goto(MBR or 0x100)

(0x2B)LDC_W: PC=PC+1; fetch;
    H=MBRU <<8
    H=MBRU OR H
    MAR=H+CPP; rd; goto iload3

(0x2F)IINC: H=LV
    MAR=MBRU+H; rd
    PC=PC+1; fetch
    H=MDR
    PC=PC+1; fetch
    MDR=MBR+H; wr; goto Main1

(0xA7)GOTO:OPC=PC-1
    goto2: PC=PC+1; fetch;
    H=MBR <<8
    H=MBRU OR H
    PC=OPC+H; fetch
    goto Main1

(0x09)IFLT: MAR=SP=SP-1; rd;
    OPC=TOS
    TOS=MDR
    N=OPC; if(N) goto T; else goto F

(0x35)IFEQ:MAR=SP=SP-1; rd;
    OPC=TOS
    TOS=MDR
    Z=OPC; if(Z) goto T; else goto F

(0x39)IF_ICMPEQ: MAR=SP=SP-1; rd
    MAR=SP=SP-1
    H=MDR;rd
    OPC=TOS
    TOS=MDR
    Z=OPC-H; if(Z) goto T; else goto F
    F:PC=PC+1
    PC=PC+1; fetch;
    goto Main1
(0x13F)T:OPC=PC-1;fetch; goto goto2


(0xB6)INVOKEVIRTUAL:PC=PC+1; fetch
    H=MBRU <<8
    H = MBRU OR H
    MAR=CPP + H; rd
    OPC = PC+1
    PC=MDR; fetch
    PC=PC+1; fetch
    H = MBRU <<8
    H = MBRU OR H
    PC=PC+1; fetch
    TOS=SP-H
    TOS=MAR=TOS+1
    PC=PC+1; fetch
    H = MBRU <<8
    H = MBRU OR H
    MDR = SP + H +1; wr 
    MAR=SP=MDR
    MDR = OPC; wr
    MAR = SP = SP+1
    MDR = LV; wr
    PC=PC+1; fetch
    LV=TOS; goto Main1

(0xCC)IRETURN:MAR=SP=LV; rd
    ireturn1:   //wait
    LV=MAR=MDR; rd
    MAR=LV+1
    PC=MDR;rd;fetch
    MAR=SP
    LV=MDR
    MDR=TOS; wr; goto Main1
    
    
    
//Push Parameters on Stack like this:
//  01.Address
//  02.Value
(0xD5)POKE: MAR = SP = SP-1; rd // fetch Address
    MAR = SP = SP-1;rd // fetch next TOS
    MAR = MDR // put Address in MAR
    H = TOS // put Value in Helper Register
    TOS = MDR // Update TOS
    MDR = H; wr; goto Main1 //Write Value to given Address

// First push the Address you want to peek on Stack
(0xDB)PEEK: MAR = TOS; rd // read Memory at given Address
    TOS = TOS //wait
    MAR = SP; wr // put Address on Stack
    TOS = MDR; goto Main1 // Update TOS

// shift word on stack by 8 Bits to the left
(0x59)SHIFT_L: MDR = TOS = TOS << 8;
    MAR = SP; wr; goto Main1

(0x67)SHIFT_R: TOS = MDR = TOS >> 1;
    MAR = SP;wr; goto Main1`

const customMicroCode: string = `Main1: PC=PC+1; fetch; goto(MBR)

(0x00)NOP:; goto Main1

(0xC6)BIPUSH: SP=MAR=SP+1;
PC=PC+1; fetch
MDR=TOS=MBR; wr; goto Main1;

(0x10)CPUSH: SP=MAR=SP+1;
PC=PC+1; fetch
MDR=TOS=MBR; wr; goto Main1;

(0x64)ISUB: MAR=SP=SP-1; rd
H=TOS
MDR=TOS=MDR-H; wr; goto Main1

(0x7E)IAND: MAR=SP=SP-1; rd
H=TOS
MDR=TOS=MDR AND H; wr; goto Main1

(0x80)IOR:MAR=SP=SP-1; rd
H=TOS
MDR=TOS=MDR OR H; wr; goto Main1

(0x59)DUP: MAR = SP = SP+1
MDR=TOS;wr;goto Main1

(0x57)POP: MAR=SP=SP-1; rd;
pop1:   //wait
TOS=MDR;goto Main1

(0x5E)SWAP: MAR=SP-1; rd;
MAR=SP
H=MDR;wr
MDR=TOS
MAR=SP-1; wr
TOS=H; goto Main1

(0x02)IADD: MAR=SP=SP-1; rd
H=TOS
MDR=TOS=MDR+H; wr; goto Main1

(0x15)ILOAD:H=LV;
MAR=MBRU+H;rd;
iload3: MAR=SP=SP+1;
PC=PC+1; fetch; wr;
TOS=MDR; goto Main1

(0x36)ISTORE: H=LV
MAR=MBRU+H
istore3: MDR=TOS;wr;
SP=MAR=SP-1;rd
PC=PC+1;fetch
TOS=MDR; goto Main1

(0xB5)WIDE: PC=PC+1; fetch; goto(MBR or 0x100)

(0x32)LDC_W: PC=PC+1; fetch;
H=MBRU <<8
H=MBRU OR H
MAR=H+CPP; rd; goto iload3

(0x84)IINC: H=LV
MAR=MBRU+H; rd
PC=PC+1; fetch
H=MDR
PC=PC+1; fetch
MDR=MBR+H; wr; goto Main1

(0xA7)GOTO:OPC=PC-1
goto2: PC=PC+1; fetch;
H=MBR <<8
H=MBRU OR H
PC=OPC+H; fetch
goto Main1

(0x9B)IFLT: MAR=SP=SP-1; rd;
OPC=TOS
TOS=MDR
N=OPC; if(N) goto T; else goto F

(0x99)IFEQ:MAR=SP=SP-1; rd;
OPC=TOS
TOS=MDR
Z=OPC; if(Z) goto T; else goto F

(0x9F)IF_ICMPEQ: MAR=SP=SP-1; rd
MAR=SP=SP-1
H=MDR;rd
OPC=TOS
TOS=MDR
Z=OPC-H; if(Z) goto T; else goto F
T:OPC=PC-1;fetch; goto goto2
F:PC=PC+1
PC=PC+1; fetch;
goto Main1

(0xB6)CINVOKE:PC=PC+1; fetch
H=MBRU <<8
H = MBRU OR H
MAR=CPP + H; rd
OPC = PC+1
PC=MDR; fetch
PC=PC+1; fetch
H = MBRU <<8
H = MBRU OR H
PC=PC+1; fetch
TOS=SP-H
TOS=MAR=TOS+1
PC=PC+1; fetch
H = MBRU <<8
H = MBRU OR H
MDR = SP + H +1; wr
MAR=SP=MDR
MDR = OPC; wr
MAR = SP = SP+1
MDR = LV; wr
PC=PC+1; fetch
LV=TOS; goto Main1

(0xCC)IRETURN:MAR=SP=LV; rd
ireturn1:   //wait
LV=MAR=MDR; rd
MAR=LV+1
PC=MDR;rd;fetch
MAR=SP
LV=MDR
MDR=TOS; wr; goto Main1`;


@Injectable({
  providedIn: 'root'
})
export class ControllerService {

  private _macroCode = new BehaviorSubject({ macroCode: ""});
  public macroCode$ = this._macroCode.asObservable();
  private _microCode = new BehaviorSubject({ microCode: ""});
  public microCode$ = this._microCode.asObservable();

  constructor(
    private macroProvider: MacroProviderService,
    private microProvider: MicroProviderService,
    private controlStore: ControlStoreService,
    private macroTokenizer: MacroTokenizerService,
    private macroParser: MacroParserService,
    private director: DirectorService,
    private mainMemory: MainMemoryService,
  ) {
    const codeMac = localStorage.getItem("macroCode");
    const codeMic = localStorage.getItem("microCode");
    if (codeMac && codeMic){
      this.setCodeInView(codeMac, codeMic);
    }
  }


  step(){
    if(this.macroProvider.getMacroGotChanged() || this.microProvider.getMicroGotChanged()){
      this.controlStore.loadMicro();
      this.macroTokenizer.init();
      this.macroParser.parse();
      this.director.reset();
    }

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

  run(){
    if(this.macroProvider.getMacroGotChanged() || this.microProvider.getMicroGotChanged()){
      this.controlStore.loadMicro();
      this.macroTokenizer.init();
      this.macroParser.parse();
      this.director.reset();
    }

    this.director.run();

    this.macroProvider.isLoaded();
    this.microProvider.isLoaded();
  }

  //reads the imported file and sets it in the macroassembler editor
  importMacro(file: any){
    if(file.type === "text/plain"){
      let fileReader = new FileReader();
      fileReader.readAsText(file);

      fileReader.onload = (e) => {
        this.macroProvider.setMacro(fileReader.result.toString());
        this._macroCode.next({ macroCode: fileReader.result.toString()});
      }

    }else{
      alert("Wrong file type!")
    }
  }

  //reads the imported file and sets it in the microprograms editor
  importMicro(file: any){
    if(file.type === "text/plain"){
      let fileReader = new FileReader();
      fileReader.readAsText(file);

      fileReader.onload = (e) => {
        this.microProvider.setMicro(fileReader.result.toString());
        this._microCode.next({ microCode: fileReader.result.toString()});
      }

    }else{
      alert("Wrong file type!")
    }
  }

  //downloads a txt file with the macrocode as content
  exportMacro(){
    var textMac: string = this.macroProvider.getMacro();
    var data = new Blob([textMac], {type: 'text/plain'});
    FileSaver.saveAs(data, 'macro.txt');
  }

  exportMicro(){
    var textMic: string = this.microProvider.getMicro();
    var data = new Blob([textMic], {type: 'text/plain'});
    FileSaver.saveAs(data, 'micro.txt');
  }

  setMacroInModel(macro: string){
    this.macroProvider.setMacro(macro);
  }

  setMicroInModel(micro: string){
    this.microProvider.setMicro(micro);
  }

  setCodeInView(macro: string, micro: string){
    this._macroCode.next({ macroCode: macro });
    this._microCode.next({ microCode: micro });
  }

  setDemoCode(demoCodeOption: string){
    if(demoCodeOption === "demo1"){
      this.microProvider.setMicro(microCode);
      this.macroProvider.setMacro(code1);
      this._macroCode.next({ macroCode: code1});
      this._microCode.next({ microCode: microCode});
    }
    if(demoCodeOption === "demo2"){
      this.microProvider.setMicro(microCode);
      this.macroProvider.setMacro(code2);
      this._macroCode.next({ macroCode: code2});
      this._microCode.next({ microCode: microCode});
    }
    if(demoCodeOption === "demo3"){
      this.microProvider.setMicro(microCode);
      this.macroProvider.setMacro(code3);
      this._macroCode.next({ macroCode: code3});
      this._microCode.next({ microCode: microCode});
    }
  }

  getEditorLineWithoutEmptyRows(line: number){
    return this.macroProvider.getEditorLineWithoutEmptyRows(line);
  }

  getEditorLineWithParserLine(parserLine: number){
    return this.macroProvider.getEditorLineWithParserLine(parserLine);
  }

  dec2hex(dec: number){
    return this.mainMemory.dec2hex(dec);
  }

}
