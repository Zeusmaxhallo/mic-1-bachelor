
export class Stack<T>{

    private items: T[] = [];

    push(item : T): void{
        this.items.push(item);
    }

    pop(): T | undefined{
        return this.items.pop();
    }

    size(): number{
        return this.items.length;
    }

    peek() : T | undefined{
        return this.items[this.items.length - 1];
    }

    /** top of stack is the last item  */
    getAll() : T[]{ 
        return this.items;
    }
}