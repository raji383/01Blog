import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Notificationbar } from './notificationbar';

describe('Notificationbar', () => {
  let component: Notificationbar;
  let fixture: ComponentFixture<Notificationbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notificationbar],
    }).compileComponents();

    fixture = TestBed.createComponent(Notificationbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
