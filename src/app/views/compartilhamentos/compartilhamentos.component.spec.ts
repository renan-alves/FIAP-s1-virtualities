import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompartilhamentosComponent } from './compartilhamentos.component';

describe('CompartilhamentosComponent', () => {
  let component: CompartilhamentosComponent;
  let fixture: ComponentFixture<CompartilhamentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompartilhamentosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompartilhamentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
