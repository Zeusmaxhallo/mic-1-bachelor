export class Microprogramms{
    micro: string = 
        `Main1: PC=PC+1; fetch; goto(MBR)
        (0x00)NOP:; goto Main1
        (0x60)IADD: MAR=SP=SP-1; rd
        H=TOS
        MDR=TOS=MDR+H; wr; goto Main1
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
        TOS=MDR;goto Main1
        (0x5F)SWAP: MAR=SP-1; rd;
        MAR=SP
        H=MDR;wr
        MDR=TOS
        MAR=SP-1; wr
        TOS=H; goto Main1
        (0x10)BIPUSH: SP=MAR=SP+1;
        PC=PC+1; fetch
        MDR=TOS=H;wr; goto Main1;
        (0x15)ILOAD:H=LV;
        iload3: MAR=SP=SP+1;
        PC=PC+1; fetch; wr;
        TOS=MDR; goto Main1
        (0x36)ISTORE: H=LV
        istore3: MDR=TOS;wr;
        SP=MAR=SP-1;rd
        PC=PC+1;fetch
        TOS=MDR; goto Main1`;

    constructor(){
        this.micro;
    }

    getMicro(){
        return this.micro;
    }
    
    setMicro(micro: string){
        this.micro = micro;
    }
}