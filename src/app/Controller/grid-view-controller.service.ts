import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GridViewControllerService {
  areEditorsSwapped: boolean = false;

  constructor() { }

  getAreEditorsSwapped(){
    return this.areEditorsSwapped;
  }

  setAreEditorsSwapped(bool: boolean){
    this.areEditorsSwapped = bool;
  }
}
