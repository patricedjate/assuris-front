import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VueLogin } from './vue-login';

describe('VueLogin', () => {
  let component: VueLogin;
  let fixture: ComponentFixture<VueLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VueLogin],
    }).compileComponents();

    fixture = TestBed.createComponent(VueLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
