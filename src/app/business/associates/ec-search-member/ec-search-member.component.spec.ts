import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcSearchMemberComponent } from './ec-search-member.component';

describe('EcSearchMemberComponent', () => {
  let component: EcSearchMemberComponent;
  let fixture: ComponentFixture<EcSearchMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EcSearchMemberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcSearchMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
