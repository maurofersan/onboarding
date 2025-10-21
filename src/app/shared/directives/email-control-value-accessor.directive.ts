import { Directive, ElementRef, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[appEmailControlValueAccessor]',
  standalone: true,
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
  private currentValue: string = ''; // Almacenar el valor actual

  @Input() appEmailControlValueAccessor: boolean = false;

  constructor(private elementRef: ElementRef) {}

  // Método para capturar el valor desde el changeEvent
  private captureValueFromChangeEvent(event: any): string {
    let value = '';
    
    // Intentar obtener el valor de diferentes maneras
    if (event.detail) {
      value = event.detail;
    } else if (event.target && event.target.value) {
      value = event.target.value;
    } else if (event.target && event.target.getAttribute('value')) {
      value = event.target.getAttribute('value');
    }
    
    console.log('Email CVA - captureValueFromChangeEvent:', {
      'event.detail': event.detail,
      'event.target.value': event.target?.value,
      'event.target.getAttribute': event.target?.getAttribute('value'),
      'final value': value
    });
    
    return value;
  }

  // Método para obtener el valor directamente del elemento
  private getCurrentValue(): string {
    const element = this.elementRef.nativeElement;
    if (element) {
      // Intentar obtener el valor de diferentes maneras
      let value = element.value || element.getAttribute('value') || '';
      
      // Si no hay valor, intentar obtenerlo del shadowRoot
      if (!value && element.shadowRoot) {
        const input = element.shadowRoot.querySelector('input');
        if (input) {
          value = input.value || '';
        }
      }
      
      // Si aún no hay valor, usar el valor almacenado
      if (!value) {
        value = this.currentValue;
      }
      
      console.log('Email CVA - getCurrentValue:', value);
      return value;
    }
    return this.currentValue;
  }

  ngOnInit(): void {
    if (!this.appEmailControlValueAccessor) {
      return;
    }

    console.log('Email CVA - Directive initialized on:', this.elementRef.nativeElement);

    // Listen to changeEvent from std-input (this is the main input event)
    this.elementRef.nativeElement.addEventListener('changeEvent', (event: any) => {
      const value = this.captureValueFromChangeEvent(event);
      console.log('Email CVA - changeEvent received:', value);
      this.currentValue = value; // Almacenar el valor actual
      this.onChange(value);
    });

    // También escuchar el evento stdInput como fallback
    this.elementRef.nativeElement.addEventListener('stdInput', (event: any) => {
      const value = event.detail || event.target?.value || '';
      console.log('Email CVA - stdInput received:', value);
      this.currentValue = value; // Almacenar el valor actual
      this.onChange(value);
    });

    // Listen to blurEvent from std-input
    this.elementRef.nativeElement.addEventListener('blurEvent', (event: any) => {
      console.log('Email CVA - blurEvent received, currentValue:', this.currentValue);
      // Obtener el valor actual del elemento
      const currentValue = this.getCurrentValue();
      console.log('Email CVA - blurEvent using getCurrentValue:', currentValue);
      this.onChange(currentValue);
      this.onTouched();
    });

    // Listen to focusEvent from std-input
    this.elementRef.nativeElement.addEventListener('focusEvent', (event: any) => {
      console.log('Email CVA - focusEvent received');
    });

    // Also listen to native input events as fallback
    this.elementRef.nativeElement.addEventListener('input', (event: any) => {
      const value = event.target?.value || '';
      console.log('Email CVA - native input event:', value);
      this.currentValue = value; // Almacenar el valor actual
      this.onChange(value);
    });

    // Also listen to native blur events as fallback
    this.elementRef.nativeElement.addEventListener('blur', (event: any) => {
      console.log('Email CVA - native blur event, currentValue:', this.currentValue);
      // Obtener el valor actual del elemento
      const currentValue = this.getCurrentValue();
      console.log('Email CVA - native blur using getCurrentValue:', currentValue);
      this.onChange(currentValue);
      this.onTouched();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    console.log('Email CVA - writeValue called with:', value);
    // Almacenar el valor actual
    this.currentValue = value || '';
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
