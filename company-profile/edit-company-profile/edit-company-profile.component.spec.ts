import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCompanyProfileComponent } from './edit-company-profile.component';

describe('EditCompanyProfileComponent', () => {
  let component: EditCompanyProfileComponent;
  let fixture: ComponentFixture<EditCompanyProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCompanyProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCompanyProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
