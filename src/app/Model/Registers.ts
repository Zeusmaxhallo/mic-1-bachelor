
export class Register{

    constructor(private name: String, private value: number, private size: number){}

    getName():String{
        return this.name;
    }

    getValue():number{
        return this.value;
    }

    getSize():number{
        return this.size;
    }

    private isValidSize(value:number):boolean{
        // normally we have a 32 signed integer [-2147483648 to 2147483647]
        return value < 2**(this.size - 1)  && value >= - (2**(this.size - 1));
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