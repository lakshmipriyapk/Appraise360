import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeProfile } from './employee-profile.component';

describe('EmployeeProfile', () => {
  let component: EmployeeProfile;
  let fixture: ComponentFixture<EmployeeProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
