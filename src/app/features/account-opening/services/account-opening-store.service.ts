import { Injectable, signal, computed, inject } from '@angular/core';
import { TextService } from '../../../core/services/text.service';
import {
  AccountOpeningFormData,
  FormFieldError,
  ValidationRule,
} from '../../../shared/interfaces/account-opening.interfaces';

@Injectable({
  providedIn: 'root',
})
export class AccountOpeningStoreService {
  private readonly textService = inject(TextService);

  // State signals
  private readonly formData = signal<Partial<AccountOpeningFormData>>({});
  private readonly errors = signal<FormFieldError[]>([]);
  private readonly isLoading = signal<boolean>(false);

  // Validation rules
  private readonly validationRules: ValidationRule[] = [
    {
      field: 'dni',
      validator: (value: string) => /^\d{8}$/.test(value),
      errorMessage: this.textService.getText('accountOpening.welcome.form.dni.error'),
    },
    {
      field: 'phone',
      validator: (value: string) => /^\d{9}$/.test(value),
      errorMessage: this.textService.getText('accountOpening.welcome.form.phone.error'),
    },
    {
      field: 'email',
      validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      errorMessage: this.textService.getText('accountOpening.welcome.form.email.error'),
    },
  ];

  // Readonly signals
  readonly formDataSignal = this.formData.asReadonly();
  readonly errorsSignal = this.errors.asReadonly();
  readonly isLoadingSignal = this.isLoading.asReadonly();

  // Computed signals
  readonly isFormValid = computed(() => {
    const data = this.formData();
    return (
      data.dni &&
      data.phone &&
      data.email &&
      data.privacyAccepted &&
      data.recaptchaValid &&
      this.errors().length === 0
    );
  });

  readonly hasFieldError = (field: keyof AccountOpeningFormData) => {
    return computed(() => {
      return this.errors().some(error => error.field === field);
    });
  };

  readonly getFieldError = (field: keyof AccountOpeningFormData) => {
    return computed(() => {
      const error = this.errors().find(error => error.field === field);
      return error?.message || '';
    });
  };

  /**
   * Updates a form field value
   */
  updateField(field: keyof AccountOpeningFormData, value: any): void {
    this.formData.update(data => ({ ...data, [field]: value }));
    this.validateField(field, value);
  }

  /**
   * Validates a specific field
   */
  private validateField(field: keyof AccountOpeningFormData, value: any): void {
    const rule = this.validationRules.find(r => r.field === field);
    if (!rule) return;

    const isValid = rule.validator(value);
    
    this.errors.update(errors => {
      const filteredErrors = errors.filter(error => error.field !== field);
      if (!isValid && value) {
        return [...filteredErrors, { field, message: rule.errorMessage }];
      }
      return filteredErrors;
    });
  }

  /**
   * Validates the entire form
   */
  validateForm(): void {
    const data = this.formData();
    const newErrors: FormFieldError[] = [];

    this.validationRules.forEach(rule => {
      const value = data[rule.field];
      if (value && !rule.validator(value)) {
        newErrors.push({ field: rule.field, message: rule.errorMessage });
      }
    });

    this.errors.set(newErrors);
  }

  /**
   * Submits the form
   */
  async submitForm(): Promise<void> {
    if (!this.isFormValid()) {
      this.validateForm();
      return;
    }

    this.isLoading.set(true);
    try {
      // TODO: Implement form submission logic
      console.log('Form submitted:', this.formData());
      // Handle success
    } catch (error) {
      console.error('Form submission error:', error);
      // Handle error
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Resets the form
   */
  resetForm(): void {
    this.formData.set({});
    this.errors.set([]);
    this.isLoading.set(false);
  }

  /**
   * Gets current form data
   */
  getFormData(): Partial<AccountOpeningFormData> {
    return this.formData();
  }
}
