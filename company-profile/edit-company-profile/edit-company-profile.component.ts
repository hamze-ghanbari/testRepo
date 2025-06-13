import { Location, NgClass, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, DestroyRef, OnInit, viewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AddBtnComponent } from '@shared/components/buttons/add-btn/add-btn.component';
import { CancelBtnComponent } from '@shared/components/buttons/cancel-btn/cancel-btn.component';
import { EmailComponent } from '@shared/components/forms/email/email.component';
import { InputComponent } from '@shared/components/forms/input/input.component';
import { NationalCodeComponent } from '@shared/components/forms/national-code/national-code.component';
import { NumberComponent } from '@shared/components/forms/number/number.component';
import { PhoneNumberComponent } from '@shared/components/forms/phone-number/phone-number.component';
import { SelectBoxComponent } from '@shared/components/forms/select-box/select-box.component';
import { SubmitBtnComponent } from '@shared/components/forms/submit-btn/submit-btn.component';
import { TextAreaComponent } from '@shared/components/forms/text-area/text-area.component';
import { UploaderComponent } from '@shared/components/forms/uploader/uploader.component';
import { GridLayoutComponent } from '@shared/components/grid-layout/grid-layout.component';
import { PageLoadingComponent } from '@shared/components/page-loading/page-loading.component';
import { COMPANY_TYPES, REAL_LEGAL_ITEMS } from '@shared/data/data.';
import { IconDirective } from '@shared/directives/icon.directive';
import { IconEnum } from '@shared/enums/icon.enum';
import { FormControlPipe } from '@shared/pipes/form-control.pipe';
import { FormGroupPipe } from '@shared/pipes/form-group.pipe';
import { ConfirmService } from '@shared/services/helper-services/confirm.service';
import { QueryService } from '@shared/services/helper-services/query.service';
import { SnackbarService } from '@shared/services/helper-services/snackbar.service';
import { fileType } from '@shared/types/file.type';
import { config, isNull, showFormError } from '@shared/utils/utils';
import { emailValidator } from '@shared/validations/email.validator';
import { fileSizeValidator } from '@shared/validations/fileSize.validator';
import { fileTypeValidator } from '@shared/validations/fileType.validator';
import { maxLengthValidator } from '@shared/validations/maxLength.validator';
import { nationalCodeValidator } from '@shared/validations/nationalCode.validator';
import { phoneValidator } from '@shared/validations/phone.validator';
import { requiredValidator } from '@shared/validations/required.validator';
import { ICompanyProfileResponse } from '@shared/interfaces/api/response/basic-setting/company-profile-response.interface';
import { concatMap, finalize, from, mergeMap, Observable, of, switchMap, take } from 'rxjs';
import { TitleComponent } from '@shared/components/title/title.component';
import { CompanyProfileService } from '@api/basic-setting/company-profile/company-profile.service';
import { ICompanyProfileRequest } from '@shared/interfaces/api/request/basic-setting/company-profile-request.interface';
import { environment } from '@environments';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingComponent } from '@shared/components/loading/loading.component';

@Component({
  selector: 'app-edit-company-profile',
  standalone: true,
  imports: [MatExpansionModule, IconDirective, SubmitBtnComponent, CancelBtnComponent, TranslatePipe, ReactiveFormsModule, InputComponent, NationalCodeComponent, PhoneNumberComponent, EmailComponent, SelectBoxComponent, FormControlPipe,
    UploaderComponent, TextAreaComponent, MatTabsModule, SubmitBtnComponent, NumberComponent, FormGroupPipe, GridLayoutComponent, TitleComponent,
    LoadingComponent
  ],
  templateUrl: './edit-company-profile.component.html',
  styleUrl: './edit-company-profile.component.scss'
})
export class EditCompanyProfileComponent implements OnInit {
  // accordion = viewChild.required(MatAccordion);
  icons = IconEnum;
  companyForm: FormGroup;
  addressForm: FormGroup;
  loading: boolean = false;
  realLegalItems = REAL_LEGAL_ITEMS;
  selectedAddressTab: number = 0;
  company: ICompanyProfileResponse;
  companyTypeList = COMPANY_TYPES;
  file: File;

  constructor(
    private fb: FormBuilder,
    private snackbar: SnackbarService,
    private router: Router,
    private confirmService: ConfirmService,
    private location: Location,
    private companyProfileService: CompanyProfileService,
    private destroyRef: DestroyRef
  ) { }
  ngOnInit(): void {
    this.companyProfileService.companyProfile().pipe(
      concatMap(res => {
        let result: Observable<File|undefined> = of(undefined);
        if (res.statusCode === 200) {
          this.company = res.data?.companyProfile;
          if (this.company) {
            this.initCompanyForm(this.company);
            if (this.company?.logoImgPath) {
            result = this.imageAddressToFileObject(environment.BASE_URL + '/' + this.company?.logoImgPath, this.company?.logoImgPath?.split('//').pop()!);
            }
          }
          else
            this.location.back();
        } else {
          this.location.back();
        }
        return result;
      })
    ).subscribe(res => {
      if(res){
       this.file = new File([res], res.name.split('\\').pop()!);
       console.log(this.file);
      }
    });
  }

  initCompanyForm(data: ICompanyProfileResponse) {
    this.companyForm = this.fb.group({
      primaryTitle: [data?.primaryTitle, [requiredValidator()]],
      secondaryTitle: [data?.secondaryTitle],
      companyType: [data?.companyType, [requiredValidator()]],
      logoFile: [
      data?.logoImgPath ? { name: data?.logoImgPath, format: data?.logoImgPath?.split('.').pop() } : ''  ,
       [fileTypeValidator(['png', 'jpg', 'jpeg']), fileSizeValidator()]
      ],
      registrationNumber: [data?.registrationNumber],
      taxIdNumber: [data?.taxIdNumber],
      nationalBusinessIdNumber: [data?.nationalBusinessIdNumber],
      nationalIdNumber: [data?.nationalIdNumber],
      phoneNumber: [data?.phoneNumber],
      cellPhoneNumber: [data?.cellPhoneNumber],
      faxNumber: [data?.faxNumber],
      emailAddress: [data?.emailAddress, [emailValidator()]],
      websiteURL: [data?.websiteURL],
    })

    // this.addressForm = this.fb.group({
    //   addresses: this.fb.array([
    //     this.fb.group({
    //       branch: ['', [requiredValidator()]],
    //       postalCode: ['', [requiredValidator()]],
    //       address: ['', [requiredValidator(), maxLengthValidator(+config('descriptionMaxLength'))]],
    //     })
    //   ])
    // })
  }

  get addresses() {
    // return (this.addresses.at(0) as FormGroup).controls['branch'];
    return this.addressForm.controls["addresses"] as FormArray;
  }



  addAddress() {
    // call api
  }

  addNewAddress() {
    this.addresses.push(this.fb.group({
      branch: ['', [requiredValidator()]],
      postalCode: ['', [requiredValidator()]],
      address: ['', [requiredValidator(), maxLengthValidator(+config('descriptionMaxLength'))]],
    }));
  }

  deleteAddress(addressIndex: number) {
    this.addresses.removeAt(addressIndex);
  }

  imageAddressToFileObject(imageUrl: string, fileName: string): Observable<File> {
    return from(fetch(imageUrl))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(response => from(response.blob())),
        switchMap(blob => of(new File([blob], fileName, { type: blob.type })))
      );
  }

  submitCompanyInfo() {
    if (this.companyForm.valid) {
      console.log(this.companyForm.value.logoFile);
      this.confirmService.open({
        title: 'general.EDIT_INFORMATION',
        message: 'general.ARE_YOU_SURE_TO_EDIT?',
        type: 'edit'
      }).pipe(
        concatMap(res => {
          if (res) {
            this.loading = true;
            let form: ICompanyProfileRequest;
            if (!this.file) {
              form = { ...this.companyForm.value, logoFile: this.companyForm.value.logoFile?.file };
              console.log('if form', form);
            } else {
              form = { ...this.companyForm.value, logoFile: this.file };
              console.log('else form', form);
            }
            return this.companyProfileService.updateCompanyProfile(form).pipe(
              finalize(() => this.loading = false)
            );
          } else
            return of(undefined);
        })
      ).subscribe(res => {
        if (res?.statusCode == 200) {
          this.location.back();
          this.snackbar.open('general.snackbar.EDIT_SUCCESS');
        }
      });
    } else {
      showFormError(this.companyForm);
    }
  }

  submitAddress() {
    if (this.companyForm.valid) {
      this.confirmService.open({
        title: 'general.EDIT_INFORMATION',
        message: 'general.ARE_YOU_SURE_TO_EDIT?',
        type: 'edit'
      }).subscribe(res => {
        if (res) {
          this.loading = true;
          this.location.back();
          this.snackbar.open('general.snackbar.EDIT_SUCCESS');
        }
      });
    } else {
      this.addresses.controls.forEach(item => {
        showFormError(item as FormGroup);
      });
    }
  }

  backToCompanyProfile() {
    this.location.back();
  }
}
