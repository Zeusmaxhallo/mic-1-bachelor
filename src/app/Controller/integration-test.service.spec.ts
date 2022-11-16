import { TestBed } from '@angular/core/testing';

import { IntegrationTestService } from './integration-test.service';


describe('IntegrationTestService', () => {
  let service: IntegrationTestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IntegrationTestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
