import { Location } from '@angular/common';
import { Component, DestroyRef, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { CompanyProfileAddressService } from '@api/basic-setting/company-profile/address/company-profile-address.service';
import { BranchService } from '@api/setting/branch/branch.service';
import { TranslatePipe } from '@ngx-translate/core';
import { CancelBtnComponent } from '@shared/components/buttons/cancel-btn/cancel-btn.component';
import { AutoCompleteComponent } from '@shared/components/forms/auto-complete/auto-complete.component';
import { CheckBoxComponent } from '@shared/components/forms/check-box/check-box.component';
import { InputComponent } from '@shared/components/forms/input/input.component';
import { NumberComponent } from '@shared/components/forms/number/number.component';
import { SelectBoxComponent } from '@shared/components/forms/select-box/select-box.component';
import { SubmitBtnComponent } from '@shared/components/forms/submit-btn/submit-btn.component';
import { TextAreaComponent } from '@shared/components/forms/text-area/text-area.component';
import { GridLayoutComponent } from '@shared/components/grid-layout/grid-layout.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { TitleComponent } from '@shared/components/title/title.component';
import { BRANCH_LIST } from '@shared/data/data.';
import { IAddressCompanyProfileResponse } from '@shared/interfaces/api/response/basic-setting/address-company-profile-response.interface';
import { FormControlPipe } from '@shared/pipes/form-control.pipe';
import { ConfirmService } from '@shared/services/helper-services/confirm.service';
import { SnackbarService } from '@shared/services/helper-services/snackbar.service';
import { SelectBoxItemType } from '@shared/types/select-box-item.type';
import { config, showFormError } from '@shared/utils/utils';
import { maxLengthValidator } from '@shared/validations/maxLength.validator';
import { requiredValidator } from '@shared/validations/required.validator';
import { merge, of, Subject } from 'rxjs';
import { catchError, concatMap, debounceTime, finalize, map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-create-address',
  standalone: true,
  imports: [TitleComponent, SubmitBtnComponent, CancelBtnComponent, TranslatePipe, ReactiveFormsModule, SelectBoxComponent, FormControlPipe,
    TextAreaComponent, MatTabsModule, SubmitBtnComponent, InputComponent, CheckBoxComponent, SelectBoxComponent, GridLayoutComponent, AutoCompleteComponent,
  LoadingComponent],
  templateUrl: './create-address.component.html',
  styleUrl: './create-address.component.scss'
})
export class CreateAddressComponent {
  @Input() id: number;
  @Input() addressId: number;
  addressForm: FormGroup;
  loading: boolean = false;
  branchList: SelectBoxItemType[] = [];
  branchTotalItems: number;
  branchSelected: number;
  branchPageNumber: number = 1;
  branchScrollLoading: boolean = false;
  initBranchLoading: boolean = true;
  branchHasError: boolean = false;
  branchSubject$: Subject<string> = new Subject();
  branchSelectedId?: number;

  constructor(
    private fb: FormBuilder,
    private snackbar: SnackbarService,
    private location: Location,
    private confirmService: ConfirmService,
    private companyProfileAddressService: CompanyProfileAddressService,
    private branchService: BranchService,
    private destroyRef: DestroyRef
  ) { }

  ngOnInit() {
    this.initAddressForm();

    

    merge(
      this.getBranchList().pipe(
       concatMap(res => {
        this.branchList = res
        if (this.addressId) {
          return this.companyProfileAddressService.getAddress(this.id, this.addressId).pipe(
            tap(res => {
              if (res.statusCode === 200) {
                this.setEditFormValues(res.data?.companyAddressDetail);
              } else {
                this.location.back();
              }
            }),
            catchError(() => of(undefined))
          )
        }
        return of(undefined);
       })
      ),
      this.branchSubject$.pipe(
        debounceTime(500),
        switchMap(value => {
          this.branchPageNumber = 1;
          this.initBranchLoading = true;
          return this.getBranchList(this.branchPageNumber, value);
        }),
        tap(res => this.branchList = res)
      )
    ).pipe(
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe()
  }

  initAddressForm() {
    this.addressForm = this.fb.group({
      branchId: [null, [requiredValidator()]],
      postalCode: [null, [requiredValidator()]],
      address: [null, [requiredValidator(), maxLengthValidator(+config('descriptionMaxLength'))]],
    })
  }

  setEditFormValues(data: IAddressCompanyProfileResponse) {
    console.log('branckId', data.branch.id);
    this.addressForm.setValue({
      branchId: data?.branch?.id ?? null,
      postalCode: data?.postalCode ?? null,
      address: data?.address ?? null
    });
  }

  submitAddress() {
    if (this.addressForm.valid) {
      if (this.addressId) {
        this.editAddress();
      } else {
        this.createAddress();
      }
    } else {
      showFormError(this.addressForm);
    }
  }

  private createAddress() {
    this.confirmService.open({
      title: 'general.REGISTRATION_INFORMATION',
      message: 'general.ARE_YOU_SURE_OF_REGISTERING_INFORMATION'
    }).pipe(
      concatMap(res => {
        if (res) {
          this.loading = true;
          return this.companyProfileAddressService.createAddress(this.id, { ...this.addressForm.value, postalCode: (this.addressForm.value.postalCode).toString() }).pipe(
            finalize(() => this.loading = false)
          )
        } else
          return of(undefined);
      })
    ).subscribe(res => {
      if (res?.statusCode == 200) {
        this.snackbar.open('general.snackbar.CREATE_SUCCESS');
        this.location.back();
      }
    });
  }

  private editAddress() {
    this.confirmService.open({
      title: 'general.EDIT_INFORMATION',
      message: 'general.ARE_YOU_SURE_TO_EDIT?',
      type: 'edit'
    }).pipe(
      concatMap(res => {
        if (res) {
          this.loading = true;
          return this.companyProfileAddressService.updateAddress(this.id, this.addressId, { ...this.addressForm.value, postalCode: (this.addressForm.value.postalCode).toString() }).pipe(
            finalize(() => this.loading = false)
          )
        } else
          return of(undefined);
      })
    ).subscribe(res => {
      if (res?.statusCode == 200) {
        this.snackbar.open('general.snackbar.EDIT_SUCCESS');
        this.location.back();
      }
    });
  }

  getBranchList(pageNumber: number = 1, searchTerm?: string) {
    return this.branchService.branches({ pageNumber, searchTerm}).pipe(
      finalize(() => {
        this.branchScrollLoading = false;
        this.initBranchLoading = false;
      }),
      map(res => {
        if (res.statusCode === 200) {
          this.branchTotalItems = res.data.totalItems;
          this.branchHasError = false;
          return res.data.branchList?.map(item => ({ uniqueId: item.id, title: item.primaryTitle }));
        }
        return [];
      }),
      catchError(error => {
        this.branchHasError = true;
        return of(error);
      }),
    );
  }

  onBranchScroll() {
    if (this.branchList.length < this.branchTotalItems && !this.branchScrollLoading) {
      ++this.branchPageNumber;
      this.branchScrollLoading = true;
      this.getBranchList(this.branchPageNumber).subscribe(res => {
        if (res) {
          this.branchList.push(...res);
        }
      })
    }
  }

  retryBranch() {
    this.branchHasError = false;
    this.initBranchLoading = true;
    this.getBranchList(this.branchPageNumber).subscribe(res => {
      if (res) {
        this.branchList.push(...res);
      }
    })
  }

  searchBranch(value: string) {
    this.branchSubject$.next(value);
  }

  optionSelected(value: string | number) {
    if (typeof value == 'number') {
      this.branchSelectedId = value;
    }
    this.addressForm.controls['branchId'].patchValue(this.branchSelectedId);
  }

  back() {
    this.location.back();
  }
}
