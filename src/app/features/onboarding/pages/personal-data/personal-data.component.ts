import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  inject,
  computed,
  signal,
  AfterViewInit,
  ElementRef,
  OnChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../../shared/base/base.component';
import { TextService } from '../../../../core/services/text.service';
import {
  AccountOpeningFormData,
  FormFieldError,
} from '../../../../shared/interfaces/account-opening.interfaces';
import { TaxDeclarationToggleComponent } from '../../../account-opening/components/tax-declaration-toggle/tax-declaration-toggle.component';
import { FormFieldComponent } from '../../../account-opening/components/form-field/form-field.component';
import { ErrorModalComponent } from './components/error-modal/error-modal.component';
import { PrivacyModalComponent } from './components/privacy-modal/privacy-modal.component';
import { FormFieldConfig } from '../../../account-opening/components/form-field/form-field.component';

@Component({
  selector: 'app-personal-data',
  standalone: true,
  imports: [TaxDeclarationToggleComponent, FormFieldComponent, ErrorModalComponent, PrivacyModalComponent],
  templateUrl: './personal-data.component.html',
  styleUrl: './personal-data.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PersonalDataComponent extends BaseComponent implements OnInit, AfterViewInit, OnChanges {
  private readonly textService = inject(TextService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  // Form data - empty by default
  formData = signal<Partial<AccountOpeningFormData>>({
    dni: '', // Empty DNI field
    phone: '',
    email: '',
    taxDeclaration: false, // "No" selected by default
    privacyAccepted: false,
    recaptchaValid: false,
  });

  // Errors state - empty by default, only show when user enters invalid data
  errors = signal<FormFieldError[]>([]);

  // Modal states
  showModal = signal<boolean>(false);
  showPrivacyModal = signal<boolean>(false);

  // Form field configurations
  readonly dniConfig: FormFieldConfig = {
    label: this.textService.getText('accountOpening.welcome.form.dni.label'),
    placeholder: this.textService.getText('accountOpening.welcome.form.dni.placeholder'),
    errorMessage: this.textService.getText('accountOpening.welcome.form.dni.error'),
    type: 'text',
    maxLength: 8,
    required: true,
  };

  readonly phoneConfig: FormFieldConfig = {
    label: this.textService.getText('accountOpening.welcome.form.phone.label'),
    placeholder: this.textService.getText('accountOpening.welcome.form.phone.placeholder'),
    errorMessage: this.textService.getText('accountOpening.welcome.form.phone.error'),
    type: 'tel',
    maxLength: 9,
    required: true,
  };

  readonly emailConfig: FormFieldConfig = {
    label: this.textService.getText('accountOpening.welcome.form.email.label'),
    placeholder: this.textService.getText('accountOpening.welcome.form.email.placeholder'),
    errorMessage: this.textService.getText('accountOpening.welcome.form.email.error'),
    type: 'email',
    required: true,
  };

  // Text signals
  readonly titlePrefix = this.textService.getTextSignal(
    'accountOpening.welcome.title.prefix'
  );
  readonly titleHighlight = this.textService.getTextSignal(
    'accountOpening.welcome.title.highlight'
  );

  readonly taxDeclarationQuestion = this.textService.getTextSignal(
    'accountOpening.welcome.form.taxDeclaration.question'
  );
  readonly taxDeclarationNo = this.textService.getTextSignal(
    'accountOpening.welcome.form.taxDeclaration.no'
  );
  readonly taxDeclarationYes = this.textService.getTextSignal(
    'accountOpening.welcome.form.taxDeclaration.yes'
  );

  readonly disclaimer = this.textService.getTextSignal(
    'accountOpening.welcome.form.disclaimer'
  );

  readonly privacyText = this.textService.getTextSignal(
    'accountOpening.welcome.form.privacy.text'
  );
  readonly privacyHighlight = this.textService.getTextSignal(
    'accountOpening.welcome.form.privacy.highlight'
  );
  readonly privacySuffix = this.textService.getTextSignal(
    'accountOpening.welcome.form.privacy.suffix'
  );

  readonly continueButton = this.textService.getTextSignal(
    'accountOpening.welcome.form.continueButton'
  );

  // Computed properties - form is invalid by default to match the second image
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

  ngOnInit(): void {
    // Initialize without errors - only show when user enters invalid data
  }

  ngAfterViewInit(): void {
    this.applyCheckboxErrorStyles();
  }

  ngOnChanges(): void {
    this.applyCheckboxErrorStyles();
  }

  /**
   * Applies error styles to std-checkbox when privacy is not accepted
   */
  private applyCheckboxErrorStyles(): void {
    // Wait for DOM to be ready
    setTimeout(() => {
      const stdCheckbox = this.elementRef.nativeElement.querySelector('std-checkbox');
      console.log('Found std-checkbox:', stdCheckbox);
      
      if (stdCheckbox) {
        // Try different selectors to find the checkbox
        let checkbox = stdCheckbox.querySelector('input[type="checkbox"]');
        if (!checkbox) {
          checkbox = stdCheckbox.shadowRoot?.querySelector('input[type="checkbox"]');
        }
        if (!checkbox) {
          checkbox = stdCheckbox.querySelector('input');
        }
        
        console.log('Found checkbox:', checkbox);
        
        if (checkbox) {
          const hasError = this.hasFieldError('privacyAccepted')();
          const isChecked = this.formData().privacyAccepted;
          console.log('Has error:', hasError, 'Is checked:', isChecked);
          
          // Only show error if not checked AND there's an error
          if (hasError && !isChecked) {
            // Apply red border only to the checkbox
            console.log('Applying red border - not checked and has error');
            checkbox.style.border = '1px solid #e74c3c';
            checkbox.style.boxShadow = 'none';
            checkbox.style.outline = 'none';
            checkbox.style.borderRadius = '4px';
          } else {
            // Remove all custom styles
            console.log('Removing red border - checked or no error');
            checkbox.style.border = '';
            checkbox.style.boxShadow = '';
            checkbox.style.outline = '';
            checkbox.style.borderRadius = '';
          }
        }
      }
    }, 10);
  }

  /**
   * Updates form field value
   */
  updateField(field: keyof AccountOpeningFormData, value: any): void {
    this.formData.update(data => ({ ...data, [field]: value }));
    // Don't validate on input change, only on blur
  }

  /**
   * Handles DNI blur event for validation
   */
  onDniBlur(value: string): void {
    this.validateDniOnBlur(value);
  }

  /**
   * Handles email blur event for validation
   */
  onEmailBlur(value: string): void {
    this.validateField('email', value);
  }

  /**
   * Handles privacy checkbox change with validation
   */
  onPrivacyChange(event: any): void {
    const accepted = event.detail?.checked || event.target?.checked || false;
    console.log('Privacy checkbox changed:', accepted);
    this.updateField('privacyAccepted', accepted);
    this.validatePrivacyCheckbox(accepted);
    // Apply styles after validation with multiple attempts
    setTimeout(() => {
      console.log('Applying checkbox styles, hasError:', this.hasFieldError('privacyAccepted')());
      this.applyCheckboxErrorStyles();
    }, 0);
    
    // Force another update after a longer delay
    setTimeout(() => {
      console.log('Second attempt to apply styles');
      this.applyCheckboxErrorStyles();
    }, 100);
  }

  /**
   * Handles privacy checkbox blur event for validation
   */
  onPrivacyBlur(): void {
    this.validatePrivacyCheckbox(this.formData().privacyAccepted || false);
    // Apply styles after validation
    setTimeout(() => this.applyCheckboxErrorStyles(), 0);
  }

  /**
   * Validates privacy checkbox - shows error if not checked
   */
  private validatePrivacyCheckbox(accepted: boolean): void {
    console.log('Validating privacy checkbox, accepted:', accepted);
    this.errors.update(errors => {
      const filteredErrors = errors.filter(error => error.field !== 'privacyAccepted');
      if (!accepted) {
        const errorMessage = this.textService.getText('accountOpening.welcome.form.privacy.error');
        console.log('Adding privacy error');
        return [...filteredErrors, { field: 'privacyAccepted', message: errorMessage }];
      } else {
        console.log('Removing privacy error');
        return filteredErrors;
      }
    });
  }

  /**
   * Validates DNI on blur - shows error if less than 8 digits
   */
  private validateDniOnBlur(value: string): void {
    // Only validate if user has entered data
    if (!value || value.trim() === '') {
      this.errors.update(errors => {
        return errors.filter(error => error.field !== 'dni');
      });
      return;
    }

    // Check if DNI has at least 8 digits
    const isValid = /^\d{8,}$/.test(value);
    
    this.errors.update(errors => {
      const filteredErrors = errors.filter(error => error.field !== 'dni');
      if (!isValid) {
        return [...filteredErrors, { field: 'dni', message: 'El DNI debe tener 8 dígitos' }];
      }
      return filteredErrors;
    });
  }

  /**
   * Validates a specific field - only show errors when user enters invalid data
   */
  private validateField(field: keyof AccountOpeningFormData, value: any): void {
    const rules: Record<string, (val: string) => boolean> = {
      dni: (val: string) => /^\d{8,}$/.test(val), // At least 8 digits
      phone: (val: string) => /^\d{9}$/.test(val),
      email: (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    };

    const validator = rules[field];
    if (!validator) return;

    // Only validate if user has entered data
    if (!value || value.trim() === '') {
      this.errors.update(errors => {
        return errors.filter(error => error.field !== field);
      });
      return;
    }

    const isValid = validator(value);
    
    this.errors.update(errors => {
      const filteredErrors = errors.filter(error => error.field !== field);
      if (!isValid) {
        const errorMessages: Record<string, string> = {
          dni: 'El DNI debe tener al menos 8 dígitos',
          phone: 'El celular debe tener 9 dígitos',
          email: 'Ingresa un correo electrónico válido',
        };
        return [...filteredErrors, { field, message: errorMessages[field] || 'Error de validación' }];
      }
      return filteredErrors;
    });
  }

  /**
   * Handles form submission
   */
  async onSubmit(): Promise<void> {
    if (this.isFormValid()) {
      console.log('Form submitted:', this.formData());
      // Navigate to next step or show success
    }
  }

  /**
   * Handles tax declaration change
   */
  onTaxDeclarationChange(value: boolean): void {
    this.updateField('taxDeclaration', value);
    
    // Show modal ONLY when "No" is selected (value = false)
    if (value === false) {
      this.showModal.set(true);
    } else {
      // Hide modal when "Sí" is selected
      this.showModal.set(false);
    }
  }

  /**
   * Closes the modal
   */
  closeModal(): void {
    this.showModal.set(false);
  }

  /**
   * Opens the privacy modal
   */
  openPrivacyModal(): void {
    this.showPrivacyModal.set(true);
  }

  /**
   * Closes the privacy modal
   */
  closePrivacyModal(): void {
    this.showPrivacyModal.set(false);
  }

  /**
   * Handles privacy acceptance
   */
  acceptPrivacy(): void {
    this.showPrivacyModal.set(false);
    
    // Activate the privacy checkbox when user accepts
    this.updateField('privacyAccepted', true);
    
    // Remove any privacy errors since user accepted
    this.errors.update(errors => errors.filter(error => error.field !== 'privacyAccepted'));
    
    console.log('Privacy accepted, checkbox should be checked:', this.formData().privacyAccepted);
  }


  /**
   * Handles reCAPTCHA validation
   */
  onRecaptchaChange(event: any): void {
    const valid = event.detail?.checked || event.target?.checked || false;
    this.updateField('recaptchaValid', valid);
  }
}