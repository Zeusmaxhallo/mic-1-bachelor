import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GridViewComponent } from './components/grid-view/grid-view.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatGridListModule} from '@angular/material/grid-list';
import {MatToolbarModule} from '@angular/material/toolbar';
import { ToolBarComponent } from './components/tool-bar/tool-bar.component';
import {MatButtonModule} from '@angular/material/button';
import { ToolBarMicViewComponent } from './components/tool-bar-mic-view/tool-bar-mic-view.component';

@NgModule({
  declarations: [
    AppComponent,
    GridViewComponent,
    ToolBarComponent,
    ToolBarMicViewComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatToolbarModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
