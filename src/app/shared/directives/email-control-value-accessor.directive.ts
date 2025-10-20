import { Directive, ElementRef, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[appEmailControlValueAccessor]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmailControlValueAccessorDirective),
      multi: true
    }
  ]
})
export class EmailControlValueAccessorDirective implements ControlValueAccessor, OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private onChange = (value: any) => {};
  private onTouched = () => {};

  @Input() appEmailControlValueAccessor: boolean = false;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    if (!this.appEmailControlValueAccessor) {
      return;
    }

    // Listen to input events from std-input
    this.elementRef.nativeElement.addEventListener('stdInput', (event: any) => {
      const value = event.detail?.value || event.target?.value || '';
      console.log('Email CVA - stdInput event:', value);
      this.onChange(value);
    });

    // Listen to blur events
    this.elementRef.nativeElement.addEventListener('blur', (event: any) => {
      console.log('Email CVA - blur event');
      this.onTouched();
    });

    // Listen to focus events
    this.elementRef.nativeElement.addEventListener('focus', (event: any) => {
      console.log('Email CVA - focus event');
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    console.log('Email CVA - writeValue called with:', value);
    if (this.elementRef.nativeElement) {
      this.elementRef.nativeElement.value = value || '';
    }
  }

  registerOnChange(fn: any): void {
    console.log('Email CVA - registerOnChange');
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    console.log('Email CVA - registerOnTouched');
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    console.log('Email CVA - setDisabledState:', isDisabled);
    if (this.elementRef.nativeElement) {
      this.elementRef.nativeElement.disabled = isDisabled;
    }
  }
}
