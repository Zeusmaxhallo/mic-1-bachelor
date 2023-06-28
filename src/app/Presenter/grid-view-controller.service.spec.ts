import { TestBed } from '@angular/core/testing';

import { GridViewControllerService } from './grid-view-controller.service';

describe('GridViewControllerService', () => {
  let service: GridViewControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridViewControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
