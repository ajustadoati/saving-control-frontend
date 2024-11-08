import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcPaymentComponent } from './ec-payment.component';

describe('EcPaymentComponent', () => {
  let component: EcPaymentComponent;
  let fixture: ComponentFixture<EcPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EcPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
