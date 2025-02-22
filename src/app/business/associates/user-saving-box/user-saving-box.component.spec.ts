import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSavingBoxComponent } from './user-saving-box.component';

describe('UserSavingBoxComponent', () => {
  let component: UserSavingBoxComponent;
  let fixture: ComponentFixture<UserSavingBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSavingBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSavingBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
