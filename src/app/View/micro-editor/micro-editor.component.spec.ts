import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicroEditorComponent } from './micro-editor.component';

describe('MicroEditorComponent', () => {
  let component: MicroEditorComponent;
  let fixture: ComponentFixture<MicroEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MicroEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MicroEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
