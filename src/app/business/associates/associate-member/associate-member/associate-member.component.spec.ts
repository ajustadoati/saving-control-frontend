import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociateMemberComponent } from './associate-member.component';

describe('AssociateMemberComponent', () => {
  let component: AssociateMemberComponent;
  let fixture: ComponentFixture<AssociateMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociateMemberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssociateMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
