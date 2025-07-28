import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryLoansComponent } from './summary-loans.component';

describe('SummaryLoansComponent', () => {
  let component: SummaryLoansComponent;
  let fixture: ComponentFixture<SummaryLoansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryLoansComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryLoansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
