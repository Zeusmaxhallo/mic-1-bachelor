import { TestBed } from '@angular/core/testing';

import { CharacterROMService } from './character-rom.service';

describe('CharacterROMService', () => {
  let service: CharacterROMService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CharacterROMService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
