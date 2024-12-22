import { JalaliPipeModule } from '@shared/pipes/jalaliPipe.module';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { JALALI_MOMENT_FORMATS, MOMENT_FORMATS } from "@shared/helper/jalali_moment_formats";
import { JalaliMomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from "@shared/helper/material.persian-date.adapter";
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import {MatDialogModule} from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
@NgModule({
  imports: [
    CommonModule,
    JalaliPipeModule,
    MatDatepickerModule,
    MatDialogModule,
    MatBottomSheetModule,
    NgxSkeletonLoaderModule,
    MatAutocompleteModule
  ],
  exports: [
    CommonModule,
    JalaliPipeModule,
    MatDatepickerModule,
    MatDialogModule,
    MatBottomSheetModule,
    NgxSkeletonLoaderModule,
    MatAutocompleteModule
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: JalaliMomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_LOCALE, useValue: 'fa' }, // en-GB  fr
    {
      provide: MAT_DATE_FORMATS,
      useFactory: (locale) => {
        if (locale === 'fa')
        {
          return JALALI_MOMENT_FORMATS;
        } else
        {
          return MOMENT_FORMATS;
        }
      },
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false } },
  ],
})
export class SharedModule { }
