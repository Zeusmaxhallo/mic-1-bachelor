import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GridViewControllerService {
  areEditorsSwapped: boolean = false;

  private _switchEditors = new BehaviorSubject({ switchEditors: false});
  public switchEditors$ = this._switchEditors.asObservable();

  constructor(
  ) { }

  switchEditors(){
    this.areEditorsSwapped = !this.areEditorsSwapped;
    this._switchEditors.next({ switchEditors: this.areEditorsSwapped});
  }
}
