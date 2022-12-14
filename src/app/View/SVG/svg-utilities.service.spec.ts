import { TestBed } from '@angular/core/testing';

import { SvgUtilitiesService } from './svg-utilities.service';

describe('SvgUtilitiesService', () => {
  let service: SvgUtilitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SvgUtilitiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
