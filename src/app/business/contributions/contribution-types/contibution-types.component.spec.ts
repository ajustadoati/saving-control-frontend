import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContibutionTypesComponent } from './contibution-types.component';

describe('ContibutionTypesComponent', () => {
  let component: ContibutionTypesComponent;
  let fixture: ComponentFixture<ContibutionTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContibutionTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContibutionTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
