import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GridViewComponent } from './View/grid-view/grid-view.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {MatGridListModule} from '@angular/material/grid-list';
import {MatToolbarModule} from '@angular/material/toolbar';
import { ToolBarComponent } from './View/tool-bar/tool-bar.component';
import {MatButtonModule} from '@angular/material/button';
import { ToolBarMicViewComponent } from './View/tool-bar-mic-view/tool-bar-mic-view.component';
import { RegisterComponent } from './View/register/register.component';
import { EditorComponent } from './View/editor/editor.component';
import {TextFieldModule} from '@angular/cdk/text-field';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import * as FileSaver from 'file-saver';
import { StackComponent } from './View/stack/stack.component';
import { MicroEditorComponent } from './View/micro-editor/micro-editor.component';
import { MicVisualizationComponent } from './View/mic-visualization/mic-visualization.component';


@NgModule({
  declarations: [
    AppComponent,
    GridViewComponent,
    ToolBarComponent,
    ToolBarMicViewComponent,
    RegisterComponent,
    EditorComponent,
    StackComponent,
    MicroEditorComponent,
    MicVisualizationComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatToolbarModule,
    MatButtonModule,
    TextFieldModule,
    MatFormFieldModule,
    FormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
