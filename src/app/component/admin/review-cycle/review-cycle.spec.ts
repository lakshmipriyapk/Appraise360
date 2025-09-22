import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewCycle } from './review-cycle';

describe('ReviewCycle', () => {
  let component: ReviewCycle;
  let fixture: ComponentFixture<ReviewCycle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewCycle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewCycle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
