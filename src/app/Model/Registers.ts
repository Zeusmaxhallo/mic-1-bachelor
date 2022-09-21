
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
        return value <= 2**(this.size) && value >= 0;
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