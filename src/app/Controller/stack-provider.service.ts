import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StackProviderService  {

  private items: Array<number> = [];
  private _sp: number = 0;
  private _lv: number = 0;


  public set lv(position: number) {
    if (position < this.items.length) {
      this._lv = position;
    }else{ 
      throw new Error("StackIndex out of range");
    }
    this.items = [...this.items];
  }

  public set sp(position: number){
    if (position < this.items.length){
      this._sp = position;
    }else{ 
      throw new Error("StackIndex out of range");
    }
    this.items = [...this.items];
  }

  public get lv() : number {
    return this._lv
  }

  public get sp() : number {
    return this._sp
  }


  push(item : number): void{
      this.items.push(item);
  }

  pop(): number | undefined{
      return this.items.pop();
  }

  size(): number{
      return this.items.length;
  }

  peek() : number | undefined{
      return this.items[this.items.length - 1];
  }

  /** top of stack is the last item  */
  getAll() : number[]{ 
      return this.items;
  }

}
