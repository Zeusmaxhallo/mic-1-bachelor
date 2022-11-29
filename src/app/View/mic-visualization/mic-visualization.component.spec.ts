import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicVisualizationComponent } from './mic-visualization.component';

describe('MicVisualizationComponent', () => {
  let component: MicVisualizationComponent;
  let fixture: ComponentFixture<MicVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MicVisualizationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MicVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
