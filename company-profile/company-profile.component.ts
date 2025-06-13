import { Location, NgClass, NgTemplateOutlet, UpperCasePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, DestroyRef, viewChild } from '@angular/core';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AddBtnComponent } from '@shared/components/buttons/add-btn/add-btn.component';
import { CancelBtnComponent } from '@shared/components/buttons/cancel-btn/cancel-btn.component';
import { EditBtnComponent } from '@shared/components/buttons/edit-btn/edit-btn.component';
import { SubmitBtnComponent } from '@shared/components/forms/submit-btn/submit-btn.component';
import { GridLayoutComponent } from '@shared/components/grid-layout/grid-layout.component';
import { IconDirective } from '@shared/directives/icon.directive';
import { IconEnum } from '@shared/enums/icon.enum';
import { ImagePipe } from '@shared/pipes/image.pipe';
import { JalaliDatePipe } from '@shared/pipes/jalali-date.pipe';
import { ICompanyProfileResponse } from '@shared/interfaces/api/response/basic-setting/company-profile-response.interface';
import { CompanyProfileService } from '@api/basic-setting/company-profile/company-profile.service';
import { catchError, concatMap, delay, finalize, merge, of, switchMap, tap } from 'rxjs';
import { PageLoadingComponent } from '@shared/components/page-loading/page-loading.component';
import { IssuerByComponent } from '@shared/components/issuer-by/issuer-by.component';
import { TitleComponent } from '@shared/components/title/title.component';
import { CompanyProfileAddressService } from '@api/basic-setting/company-profile/address/company-profile-address.service';
import { IAddressCompanyProfileResponse } from '@shared/interfaces/api/response/basic-setting/address-company-profile-response.interface';
import { ConfirmService } from '@shared/services/helper-services/confirm.service';
import { SnackbarService } from '@shared/services/helper-services/snackbar.service';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { config, getPageInfo } from '@shared/utils/utils';
import { QueryService } from '@shared/services/helper-services/query.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [MatExpansionModule, IconDirective, TitleComponent, TranslatePipe, MatTabsModule, AddBtnComponent, GridLayoutComponent, PageLoadingComponent, EditBtnComponent,
    IssuerByComponent, ImagePipe, UpperCasePipe, PaginationComponent
  ],
  templateUrl: './company-profile.component.html',
  styleUrl: './company-profile.component.scss'
})
export class CompanyProfileComponent {
  icons = IconEnum;
  company: ICompanyProfileResponse;
  loading: boolean = true;
  addresses: IAddressCompanyProfileResponse[] = [];
  addressLoading: boolean = false;
  addressTab: boolean = false;
  totalItems: number;
  pageInfo: { pageNumber: number; pageSize: number } = {
    pageNumber: 1,
    pageSize: +config('minPageSize')
  };

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private companyProfileService: CompanyProfileService,
    private confirmService: ConfirmService,
    private companyProfileAddressService: CompanyProfileAddressService,
    private snackbar: SnackbarService,
    private queryService: QueryService,
    private destroyRef: DestroyRef
  ) { }

  ngOnInit() {
    merge(
      this.companyProfileService.companyProfile().pipe(
        finalize(() => this.loading = false),
        tap(res => {
          if (res.statusCode == 200) {
            this.company = res.data.companyProfile;
          }
        }),
        catchError(() => of(undefined))
      ),
        this.queryService.query.pipe(
          switchMap(res => {
            if(res && this.company){
              this.pageInfo = getPageInfo(res);
              return this.getAddresses().pipe(
                tap(res => {
                  if (res.statusCode === 200) {
                    this.addresses = res.data.companyProfileAddressList;
                  }
                }),
                catchError(() => of(undefined))
              )
            }
            return of([]);
          })
        )
    ).pipe(
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe();
  }

  changeTab(event: MatTabChangeEvent) {
    this.addressTab = event.index == 1;
    if (this.addressTab && !this.addresses.length) {
      this.addressLoading = true;
      this.getAddresses().subscribe(res => {
        if (res.statusCode === 200) {
          this.addresses = res.data?.companyProfileAddressList;
        }
      })
    }
  }
  
  getAddresses(){
    return  this.companyProfileAddressService.addresses(this.company?.id, {pageNumber: this.pageInfo.pageNumber, pageSize: this.pageInfo.pageSize}).pipe(
      finalize(() => this.addressLoading = false),
      tap(res => {
        if(res.statusCode === 200){
          this.totalItems = res.data?.totalItems;
        }
      })
    );
  }

  deleteAddress(addressId: number) {
    this.confirmService.open({
      title: 'general.DELETE_INFORMATION',
      message: 'general.ARE_YOU_SURE_OF_DELETE_INFORMATION',
      type: 'delete'
    }).pipe(
      concatMap(res => {
        if (res) {
          return this.companyProfileAddressService.deleteAddress(this.company.id, addressId);
        } else
          return of(undefined);
      })
    )
      .subscribe((res) => {
        if (res?.statusCode == 200) {
          this.snackbar.open('general.snackbar.DELETE_SUCCESS');
          const index = this.addresses.findIndex(item => item.id == addressId);
          this.addresses.splice(index, 1);
        }
      });
  }


  goToEditAddress(addressId: number) {
    this.router.navigate([`${this.company?.id}/address/edit`, addressId], { relativeTo: this.activeRoute });
  }

  addAddress() {
    this.router.navigate([`${this.company?.id}/address/create`], { relativeTo: this.activeRoute });
  }

  goToEditInfo() {
    this.router.navigate(['edit'], { relativeTo: this.activeRoute });
  }

}
