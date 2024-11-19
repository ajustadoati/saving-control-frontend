import { TestBed } from '@angular/core/testing';

import { ContributionTypesService } from './contribution-types.service';

describe('ContributionTypesService', () => {
  let service: ContributionTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContributionTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
