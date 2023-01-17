import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShifterComponent } from './shifter.component';

describe('ShifterComponent', () => {
  let component: ShifterComponent;
  let fixture: ComponentFixture<ShifterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShifterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShifterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
