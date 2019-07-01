@Component({
  selector: 'app-example',
  template: `<button (click)="onSubmitClick()">ارسال</button>`
})
export class ExampleComponent {
  private submitClick$?: Subject<void>;
  private destroyRef = inject(DestroyRef);

  onSubmitClick() {
    if (!this.submitClick$) {
      this.submitClick$ = new Subject<void>();

      this.submitClick$
        .pipe(
          throttleTime(2000),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          this.onSubmit();
        });
    } 

    this.submitClick$.next();
  }

  onSubmit() {
    console.log('فرم ارسال شد', new Date().toISOString());
  }
}
