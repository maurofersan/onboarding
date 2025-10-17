import {
  Component,
  Input,
  Output,
  EventEmitter,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextService } from '../../../../core/services/text.service';
import { NumbersOnlyDirective, DniValidationDirective } from '../../../../shared/directives';

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
  imports: [CommonModule, NumbersOnlyDirective, DniValidationDirective],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FormFieldComponent {
  private readonly textService = inject(TextService);

  @Input() config!: FormFieldConfig;
  @Input() value: string = '';
  @Input() hasError: boolean = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() blur = new EventEmitter<string>();

  readonly fieldType = computed(() => this.config?.type || 'text');
  readonly maxLength = computed(() => this.config?.maxLength);
  readonly shouldUseNumbersOnly = computed(() => this.config?.numbersOnly || false);
  readonly shouldUseDniValidation = computed(() => this.config?.dniValidation || false);

  onInputChange(event: any): void {
    const newValue = event.detail?.value || event.target?.value || '';
    this.valueChange.emit(newValue);
  }

  onBlur(event: any): void {
    const value = event.detail?.value || event.target?.value || this.value;
    this.blur.emit(value);
  }
}
