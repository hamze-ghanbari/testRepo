import { NgClass } from '@angular/common';
import { Component, computed, effect, EventEmitter, forwardRef, Input, Output, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { IconDirective } from '@shared/directives/icon.directive';
import { NumberValueDirective } from '@shared/directives/number-value.directive';
import { IconEnum } from '@shared/enums/icon.enum';
import { FormatBytesPipe } from '@shared/pipes/format-bytes.pipe';
import { ShowErrorPipe } from '@shared/pipes/show-error.pipe';
import { formatBytesTransform } from '@shared/pipes/transformers/transformers';
import { NullStringType } from '@shared/types/null-string.type';
import { UploaderType } from '@shared/types/upload.type';
import { filter, reduce } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SafeUrl } from '@angular/platform-browser';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CropperDialogComponent } from '@shared/components/dialogs/cropper-dialog/cropper-dialog.component';
import { fileType } from '@shared/types/file.type';
import { CropperDialogResultType } from '@shared/types/cropper-dialog-result.type';
import { config } from '@shared/utils/utils';
import { ImagePipe } from '@shared/pipes/image.pipe';
import { environment } from '@environments';

@Component({
  selector: 'app-uploader',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, ShowErrorPipe, MatFormFieldModule, MatInputModule, IconDirective, TranslatePipe, FormatBytesPipe, MatProgressSpinnerModule, MatDialogModule, ImagePipe],
  templateUrl: './uploader.component.html',
  styleUrl: './uploader.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UploaderComponent), multi: true },
  ]
})
export class UploaderComponent {
  icons = IconEnum;
  singleFile: fileType | null;
  files: fileType[] = [];
  fileId: number = 0;
  image: string;
  private onChange: (value: fileType | fileType[] | null) => void = (value: fileType | fileType[] | null) => null;
  private onTouched: () => void = () => undefined;
  value: fileType | null;
  @Input({ required: true }) field: FormControl;
  @Input({ required: true }) config: { label: string, maxSize: string, multiple?: boolean, required?: boolean };

imageWidth = signal(0);
  @Input({required: true}) set width(val: number) {
    this.imageWidth.set(val);
  }

  imageHeight = signal(0);
  @Input({required: true}) set height(val: number) {
    this.imageHeight.set(val);
  }
  @Output() imageReady = new EventEmitter<Blob>();
  
  croppedImage = signal<CropperDialogResultType | undefined>(undefined);
  
  imageSource = computed(() => {
    // if (this.croppedImage()) {
      return this.croppedImage()?.imageUrl;
    // }
  });

  constructor(
    private dialog: MatDialog
  ) {
    // effect(() => {
          if (this.croppedImage()) {
            this.imageReady.emit(this.croppedImage()?.blob);
          }
        // });
   }

  public writeValue(value: fileType): void {
    this.value = value;
    this.image = this.imageSource() ?? `${environment.BASE_URL}/${this.value?.name}` ?? '';
    this.singleFile = value;
  }

  public registerOnChange(fn: (value: fileType | fileType[] | null) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
    // Implement if needed
  }

  public onValueChanged(event: any): void {
    // if(!this.field.errors){
    const file: File = event.target.files[0];
    if (file) {
      this.image = '';
      // if(!this.field.errors){
      if (this.config.multiple) {
        this.files.push({
          name: file.name,
          size: file.size,
          format: file.name.split('.').at(-1) as string,
          fileId: this.fileId++,
          status: 'success',
          isLoading: true,
          file: {...file, name: this.croppedImage()}
        });
      } else {
        this.singleFile = {
          name: file.name,
          size: file.size,
          format: file.name.split('.').at(-1) as string,
          fileId: this.fileId++,
          status: 'success',
          isLoading: true,
          file
        }
      }
      // }
      if ((config('imageFormat') as string[]).includes(file.name.split('.').at(-1) as string)) {
        const dialogRef = this.dialog.open(CropperDialogComponent, {
              data: {
                image: file,
                width: this.imageWidth(),
                height: this.imageHeight(),
              },
              width: '500px',
            });
        dialogRef.afterClosed()
          // .pipe(filter((result) => !!result))
          .subscribe((result) => {
            if(result){
              if (this.config.multiple)
              this.files.at(-1)!.preview = result.imageUrl;
              else{
              this.croppedImage.set(result);
              this.singleFile = {
                name: file.name,
                size: file.size,
                format: file.name.split('.').at(-1) as string,
                fileId: this.fileId++,
                status: 'success',
                isLoading: true,
                file: new File([file], this.croppedImage()?.imageUrl.split('//').pop()!+'.'+ file.name.split('.').at(-1) as string)
              }
              }
              this.value = this.config.multiple ? this.files[this.files.length - 1] : this.singleFile;
              console.log('index value', this.value, this.croppedImage()?.blob.type)
                // if(this.onChange){
                if (this.value) {
                  this.onChange(this.value);
                }
            }else{
              this.files.splice(this.files.length -1, 1);
              this.singleFile = null;
              this.croppedImage.set(undefined);
            }
          });

        // let item;
        // if (this.config.multiple)
        //   item = this.files.find(i => i.name == file.name);
        // else
        //   item = this.singleFile;
        // if (item) {
        //   const reader = new FileReader();
        //   reader.onload = () => {
        //     item.preview = reader.result as string;
        //   };
        //   reader.readAsDataURL(file);
        // }
      }
      if(this.config.multiple){
      setTimeout(() => {
        this.files.at(-1)!.isLoading = false;
      }, 2000);
    }
      // }
    }
    // }
  }

  public onBlur(): void {
    this.onTouched();
  }

  deleteSingleImage(event: Event, file: fileType | null) {
    event.stopPropagation();
    this.onChange(null);
    // this.delete.emit(this.singleFile as fileType);
    this.singleFile = null;
    this.croppedImage.set(undefined);
    // call api
  }
  
  deleteImage(item: fileType) {
    // call api
    // this.delete.emit(item);
    let index = this.files.findIndex(i => i.fileId == item.fileId);
    item.isLoading = true;
    setTimeout(() => {
      if (index > -1) {
        item.isLoading = false;
        this.files.splice(index, 1);
        this.onChange(this.files);
        // this.value = this.config.multiple ? this.files[this.files.length - 1] : this.singleFile;
      }
    }, 2000);
  }

  refresh(item: fileType) {
   
  }
}
