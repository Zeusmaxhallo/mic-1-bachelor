
export class Register{

    constructor(private name: string, private value: number, private size: number){}

    getName():string{
        return this.name;
    }

    getValue():number{
        return this.value;
    }

    getSize():number{
        return this.size;
    }

    // private isValidSize(value:number):boolean{
    //     // normally we have a 32 signed integer [-2147483648 to 2147483647]
    //     return value < 2**(this.size - 1)  && value >= - (2**(this.size - 1));
    // }

    private isValidSize(value:number):boolean{
        // Accepts values that fit in 8 bits unsigned
        return value < 2**(this.size)  && value >= 0;
    }

    
    setValue(value: number){
        if(this.isValidSize(value)){
            this.value = value;
        }
        else{
            throw new Error("Register overflow");
        }
    }
}