import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ABusComponent } from './a-bus.component';

describe('ABusComponent', () => {
  let component: ABusComponent;
  let fixture: ComponentFixture<ABusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ABusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ABusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
