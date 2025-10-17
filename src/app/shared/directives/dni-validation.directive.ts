import { Directive, ElementRef, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator, ValidationErrors } from '@angular/forms';

@Directive({
  selector: '[appDniValidation]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: DniValidationDirective,
      multi: true
    }
  ]
})
export class DniValidationDirective implements Validator {
  @Input() appDniValidation: boolean = true;
  @Output() dniValidationChange = new EventEmitter<boolean>();

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    // Limitar a 8 dígitos máximo
    if (value.length > 8) {
      input.value = value.substring(0, 8);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const isValid = this.validateDni(value);
    
    // Emitir el estado de validación
    this.dniValidationChange.emit(isValid);
    
    // Agregar/quitar clase de error
    if (!isValid && value.length > 0) {
      input.classList.add('error');
    } else {
      input.classList.remove('error');
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (!this.appDniValidation) {
      return null;
    }

    const value = control.value;
    if (!value) {
      return null; // No validar si está vacío
    }

    return this.validateDni(value) ? null : { dniInvalid: true };
  }

  private validateDni(value: string): boolean {
    if (!value) {
      return true; // Vacío es válido (no requerido)
    }

    // Debe tener exactamente 8 dígitos
    if (value.length !== 8) {
      return false;
    }

    // Debe contener solo números
    if (!/^\d{8}$/.test(value)) {
      return false;
    }

    return true;
  }
}
