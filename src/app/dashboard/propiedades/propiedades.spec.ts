import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Propiedades } from './propiedades';

describe('Propiedades', () => {
  let component: Propiedades;
  let fixture: ComponentFixture<Propiedades>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Propiedades],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Propiedades);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
