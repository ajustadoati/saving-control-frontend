import { TestBed } from '@angular/core/testing';

import { UserSavingBoxService } from './user-saving-box.service';

describe('UserSavingBoxService', () => {
  let service: UserSavingBoxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserSavingBoxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
