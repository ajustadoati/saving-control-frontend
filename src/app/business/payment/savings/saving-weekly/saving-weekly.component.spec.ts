import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingWeeklyComponent } from './saving-weekly.component';

describe('SavingWeeklyComponent', () => {
  let component: SavingWeeklyComponent;
  let fixture: ComponentFixture<SavingWeeklyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingWeeklyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavingWeeklyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
