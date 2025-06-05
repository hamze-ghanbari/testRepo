import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidenavUserAdminComponent } from './sidenav-user-admin.component';

describe('SidenavUserAdminComponent', () => {
  let component: SidenavUserAdminComponent;
  let fixture: ComponentFixture<SidenavUserAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidenavUserAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidenavUserAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
