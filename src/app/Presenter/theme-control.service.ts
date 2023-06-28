import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeControlService {

  constructor() { }

  private _toggleThemeNotifier = new BehaviorSubject(false);
  public toggleThemeNotifier$ = this._toggleThemeNotifier.asObservable();

  private darkMode = false;


  public toggleTheme(){
    document.body.classList.toggle("light-theme");
    document.body.classList.toggle("darkMode");
    this.darkMode = !this.darkMode; 
    this._toggleThemeNotifier.next(this.darkMode);
  }
}
