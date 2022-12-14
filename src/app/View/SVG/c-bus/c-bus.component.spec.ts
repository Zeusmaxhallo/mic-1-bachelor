import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CBusComponent } from './c-bus.component';

describe('CBusComponent', () => {
  let component: CBusComponent;
  let fixture: ComponentFixture<CBusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CBusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CBusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
