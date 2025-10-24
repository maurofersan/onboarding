import {
  Component,
  Input,
  Output,
  EventEmitter,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  computed,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextService } from '../../../../core/services/text.service';
import { NumbersOnlyDirective, EmailControlValueAccessorDirective } from '../../../../shared/directives';

export interface FormFieldConfig {
  label: string;
  placeholder: string;
  errorMessage: string;
  type?: 'text' | 'email' | 'tel' | 'password';
  maxLength?: number;
  required?: boolean;
  numbersOnly?: boolean;
  dniValidation?: boolean;
}

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, NumbersOnlyDirective, EmailControlValueAccessorDirective],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FormFieldComponent {
  private readonly textService = inject(TextService);
  private readonly elementRef = inject(ElementRef);

  @Input() config!: FormFieldConfig;
  @Input() value: string = '';
  @Input() hasError: boolean = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() focus = new EventEmitter<void>();
  @Output() blur = new EventEmitter<string>();

  readonly fieldType = computed(() => this.config?.type || 'text');
  readonly maxLength = computed(() => this.config?.maxLength);
  readonly shouldUseNumbersOnly = computed(() => this.config?.numbersOnly || false);
  readonly shouldUseDniValidation = computed(() => this.config?.dniValidation || false);

  onInputChange(event: any): void {
    const newValue = event.detail?.value || event.target?.value || '';
    console.log('FormField onInputChange - event:', event);
    console.log('FormField onInputChange - newValue:', newValue);
    console.log('FormField onInputChange - newValue length:', newValue.length);
    this.valueChange.emit(newValue);
  }

  onChangeEvent(event: any): void {
    const newValue = event.detail || event.target?.value || '';
    console.log('FormField onChangeEvent - event:', event);
    console.log('FormField onChangeEvent - event.detail:', event.detail);
    console.log('FormField onChangeEvent - event.target:', event.target);
    console.log('FormField onChangeEvent - newValue:', newValue);
    this.valueChange.emit(newValue);
  }

  onFocus(event: any): void {
    this.focus.emit();
  }

  onBlur(event: any): void {
    // Si es un campo de email y tiene la directiva CVA, no interferir
    if (this.config?.type === 'email' && this.elementRef.nativeElement.hasAttribute('appEmailControlValueAccessor')) {
      console.log('FormField onBlur - Email CVA active, skipping form-field logic');
      return;
    }

    // Try to get the value from different possible sources
    let value = '';
    
    if (event.detail && event.detail.value !== undefined) {
      value = event.detail.value;
    } else if (event.target && event.target.value !== undefined) {
      value = event.target.value;
    } else if (this.value !== undefined) {
      value = this.value;
    }
    
    console.log('FormField onBlur - event:', event);
    console.log('FormField onBlur - value from event.detail:', event.detail?.value);
    console.log('FormField onBlur - value from event.target:', event.target?.value);
    console.log('FormField onBlur - value from this.value:', this.value);
    console.log('FormField onBlur - final value:', value);
    
    this.blur.emit(value);
  }
}
