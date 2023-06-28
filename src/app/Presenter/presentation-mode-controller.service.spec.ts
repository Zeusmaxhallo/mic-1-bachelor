import { TestBed } from '@angular/core/testing';

import { PresentationModeControllerService } from './presentation-mode-controller.service';

describe('PresentationModeControllerService', () => {
  let service: PresentationModeControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PresentationModeControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
