import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociateCreateComponent } from './associate-create.component';

describe('AssociateCreateComponent', () => {
  let component: AssociateCreateComponent;
  let fixture: ComponentFixture<AssociateCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociateCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssociateCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
