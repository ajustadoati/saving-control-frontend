import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawBalanceComponent } from './withdraw-balance.component';

describe('WithdrawBalanceComponent', () => {
  let component: WithdrawBalanceComponent;
  let fixture: ComponentFixture<WithdrawBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WithdrawBalanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WithdrawBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
