import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Finalizacion } from './finalizacion';

describe('Finalizacion', () => {
  let component: Finalizacion;
  let fixture: ComponentFixture<Finalizacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Finalizacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Finalizacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
