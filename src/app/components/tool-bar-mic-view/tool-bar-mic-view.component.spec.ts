import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolBarMicViewComponent } from './tool-bar-mic-view.component';

describe('ToolBarMicViewComponent', () => {
  let component: ToolBarMicViewComponent;
  let fixture: ComponentFixture<ToolBarMicViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToolBarMicViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolBarMicViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
