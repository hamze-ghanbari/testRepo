import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { CancelBtnComponent } from '@shared/components/buttons/cancel-btn/cancel-btn.component';
import { SubmitBtnComponent } from '@shared/components/forms/submit-btn/submit-btn.component';
import { CropperDialogDataType } from '@shared/types/cropper-dialog-data.type';
import { CropperDialogResultType } from '@shared/types/cropper-dialog-result.type';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

@Component({
  selector: 'app-cropper-dialog',
  standalone: true,
  imports: [MatButtonModule, ImageCropperComponent, MatRippleModule, TranslatePipe, SubmitBtnComponent, CancelBtnComponent],
  templateUrl: './cropper-dialog.component.html',
  styleUrl: './cropper-dialog.component.scss'
})
export class CropperDialogComponent {
  data: CropperDialogDataType = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef);
  result = signal<CropperDialogResultType | undefined>(undefined);

  imageCropped(event: ImageCroppedEvent) {
    const { blob, objectUrl } = event;
    if (blob && objectUrl) {
      this.result.set({ blob, imageUrl: objectUrl });
    }
  }

  close(){
    this.dialogRef.close(this.result());
  }
  
  cancel(){
    this.dialogRef.close();
  }
}
