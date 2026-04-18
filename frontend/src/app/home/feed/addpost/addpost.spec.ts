import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addpost } from './addpost';

describe('Addpost', () => {
  let component: Addpost;
  let fixture: ComponentFixture<Addpost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addpost],
    }).compileComponents();

    fixture = TestBed.createComponent(Addpost);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
