import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociateSetupComponent } from './associate-setup.component';

describe('AssociateSetupComponent', () => {
  let component: AssociateSetupComponent;
  let fixture: ComponentFixture<AssociateSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociateSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssociateSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
