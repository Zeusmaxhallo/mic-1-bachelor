import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BBusComponent } from './b-bus.component';

describe('BBusComponent', () => {
  let component: BBusComponent;
  let fixture: ComponentFixture<BBusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BBusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BBusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
