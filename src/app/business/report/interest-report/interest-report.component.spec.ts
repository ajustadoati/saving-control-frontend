import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestReportComponent } from './interest-report.component';

describe('InterestReportComponent', () => {
  let component: InterestReportComponent;
  let fixture: ComponentFixture<InterestReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterestReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterestReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
