import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultPaymentComponent } from './default-payment.component';

describe('DefaultPaymentComponent', () => {
  let component: DefaultPaymentComponent;
  let fixture: ComponentFixture<DefaultPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaultPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
