import { throwError } from "rxjs";

export class Register{

    constructor(private name: String, private value: number, private size: number){
    }

    getName(){
        return this.name;
    }

    getValue(){
        return this.value;
    }

    getSize(){
        return this.size;
    }

    
    setValue(value: number){
        if(value <= this.size){
            this.value = value;
        }
        else{
            throw new Error("Register overflow");
        }
    }
}