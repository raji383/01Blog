import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowOptions } from './show-options';

describe('ShowOptions', () => {
  let component: ShowOptions;
  let fixture: ComponentFixture<ShowOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowOptions],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowOptions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
