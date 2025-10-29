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
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
import { CaptchaService } from '../../../../core/services/captcha.service';

@Component({
  selector: 'app-personal-data',
  standalone: true,
  imports: [TaxDeclarationToggleComponent, FormFieldComponent, ErrorModalComponent, PrivacyModalComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './personal-data.component.html',
  styleUrl: './personal-data.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PersonalDataComponent extends BaseComponent implements OnInit, AfterViewInit, OnChanges {
  private readonly textService = inject(TextService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly captchaService = inject(CaptchaService);

  // FormGroup para el email
  emailForm!: FormGroup;

  // Computed signal para el error del email
  readonly emailHasError = computed(() => {
    const emailControl = this.emailForm?.get('email');
    const hasError = !!(emailControl?.invalid && emailControl?.touched);
    console.log('emailHasError computed:', {
      invalid: emailControl?.invalid,
      touched: emailControl?.touched,
      hasError: hasError,
      value: emailControl?.value,
      errors: emailControl?.errors
    });
    return hasError;
  });
  private readonly elementRef = inject(ElementRef);

  // Form data - empty by default
  formData = signal<Partial<AccountOpeningFormData>>({
    dni: '', // Empty DNI field
    phone: '',
    email: '',
    taxDeclaration: true, // "Sí" selected by default
    privacyAccepted: false,
  });

  // reCAPTCHA token
  recaptchaToken = signal<string>('');


  // Errors state - empty by default, only show when user enters invalid data
  errors = signal<FormFieldError[]>([]);

  // Touched fields - tracks which fields have been focused
  touchedFields = signal<Set<keyof AccountOpeningFormData>>(new Set());

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
    numbersOnly: true,
    dniValidation: true,
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
      this.errors().length === 0
    );
  });

  readonly hasFieldError = (field: keyof AccountOpeningFormData) => {
    return computed(() => {
      const hasError = this.errors().some(error => error.field === field);
      console.log(`hasFieldError for ${field}:`, hasError, 'errors:', this.errors());
      return hasError;
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
    
    // Inicializar FormGroup para el email
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
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
    console.log(`updateField called for ${field} with value:`, value);
    this.formData.update(data => {
      const newData = { ...data, [field]: value };
      console.log(`Updated formData for ${field}:`, newData);
      return newData;
    });
  }

  updateEmailField(value: string): void {
    console.log('updateEmailField called with value:', value);
    
    // Actualizar el FormControl
    this.emailForm.get('email')?.setValue(value);
    this.emailForm.get('email')?.markAsTouched();
    this.emailForm.get('email')?.markAsDirty();
    
    // Actualizar el formData
    this.updateField('email', value);
    
    // Log del estado
    console.log('Email FormControl state:', {
      value: this.emailForm.get('email')?.value,
      invalid: this.emailForm.get('email')?.invalid,
      touched: this.emailForm.get('email')?.touched,
      dirty: this.emailForm.get('email')?.dirty,
      errors: this.emailForm.get('email')?.errors
    });
  }


  /**
   * Marks a field as touched when focused
   */
  onFieldFocus(field: keyof AccountOpeningFormData): void {
    console.log(`onFieldFocus called for ${field}`);
    this.touchedFields.update(touched => {
      const newTouched = new Set([...touched, field]);
      console.log(`Updated touchedFields:`, Array.from(newTouched));
      return newTouched;
    });
  }

  /**
   * Handles DNI focus event
   */
  onDniFocus(): void {
    this.onFieldFocus('dni');
  }

  /**
   * Handles DNI blur event for validation
   */
  onDniBlur(value: string): void {
    console.log('onDniBlur called with value:', value);
    this.validateDniOnBlur(value);
  }

  /**
   * Handles phone focus event
   */
  onPhoneFocus(): void {
    this.onFieldFocus('phone');
  }

  /**
   * Handles phone blur event for validation
   */
  onPhoneBlur(value: string): void {
    console.log('onPhoneBlur called with value:', value);
    this.validatePhoneOnBlur(value);
  }

  /**
   * Handles email focus event
   */
  onEmailFocus(): void {
    this.onFieldFocus('email');
  }

  /**
   * Handles email blur event for validation
   */
  onEmailBlur(value: string): void {
    console.log('onEmailBlur called with value:', value);
    
    // Actualizar el FormControl con el valor
    this.emailForm.get('email')?.setValue(value);
    this.emailForm.get('email')?.markAsTouched();
    
    // Log del estado después del blur
    console.log('Email FormControl after blur:', {
      value: this.emailForm.get('email')?.value,
      invalid: this.emailForm.get('email')?.invalid,
      touched: this.emailForm.get('email')?.touched,
      errors: this.emailForm.get('email')?.errors
    });
    
    // También ejecutar la validación personalizada
    this.validateEmailOnBlur(value);
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
   * Validates DNI on blur - shows error if less than 8 digits or empty when touched
   */
  private validateDniOnBlur(value: string): void {
    console.log('validateDniOnBlur called with value:', value);
    const isTouched = this.touchedFields().has('dni');
    const isEmpty = !value || value.trim() === '';
    const hasValue = value && value.trim() !== '';
    
    console.log('DNI validation:', { value, isTouched, isEmpty, hasValue });
    
    // Only validate if the field has been touched by the user
    if (!isTouched) {
      console.log('DNI not touched, skipping validation');
      return;
    }
    
    // Clear all errors for DNI first
    this.errors.update(errors => {
      const filteredErrors = errors.filter(error => error.field !== 'dni');
      let newErrors = [...filteredErrors];

      // If field has value, validate format
      if (hasValue) {
        const isValid = /^\d{8}$/.test(value);
        console.log('DNI format validation:', { value, isValid });
        
        if (!isValid) {
          newErrors.push({ field: 'dni', message: 'El DNI debe tener 8 dígitos' });
        }
      }
      // If field is touched and empty, show required error
      else if (isEmpty) {
        newErrors.push({ field: 'dni', message: 'El DNI es requerido' });
      }

      return newErrors;
    });
  }

  /**
   * Validates phone on blur - shows error if less than 9 digits or empty when touched
   */
  private validatePhoneOnBlur(value: string): void {
    console.log('validatePhoneOnBlur called with value:', value);
    const isTouched = this.touchedFields().has('phone');
    const isEmpty = !value || value.trim() === '';
    const hasValue = value && value.trim() !== '';
    
    console.log('Phone validation:', { value, isTouched, isEmpty, hasValue });
    
    // Only validate if the field has been touched by the user
    if (!isTouched) {
      console.log('Phone not touched, skipping validation');
      return;
    }
    
    // Clear all errors for phone first
    this.errors.update(errors => {
      const filteredErrors = errors.filter(error => error.field !== 'phone');
      let newErrors = [...filteredErrors];

      // If field has value, validate format
      if (hasValue) {
        const isValid = /^\d{9}$/.test(value);
        console.log('Phone format validation:', { value, isValid });
        
        if (!isValid) {
          newErrors.push({ field: 'phone', message: 'El celular debe tener 9 dígitos' });
        }
      }
      // If field is touched and empty, show required error
      else if (isEmpty) {
        newErrors.push({ field: 'phone', message: 'El celular es requerido' });
      }

      return newErrors;
    });
  }

  /**
   * Validates email on blur - shows error if invalid format or empty when touched
   */
  private validateEmailOnBlur(value: string): void {
    console.log('validateEmailOnBlur called with value:', value);
    const isTouched = this.touchedFields().has('email');
    const isEmpty = !value || value.trim() === '';
    const hasValue = value && value.trim() !== '';
    
    console.log('Email validation:', { value, isTouched, isEmpty, hasValue });
    
    // Only validate if the field has been touched by the user
    if (!isTouched) {
      console.log('Email not touched, skipping validation');
      return;
    }
    
    // Clear all errors for email first
    this.errors.update(errors => {
      const filteredErrors = errors.filter(error => error.field !== 'email');
      let newErrors = [...filteredErrors];

      // If field has value, validate format
      if (hasValue) {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        console.log('Email format validation:', { value, isValid });
        
        if (!isValid) {
          newErrors.push({ field: 'email', message: 'Ingresa un correo electrónico válido' });
        }
      }
      // If field is touched and empty, show required error
      else if (isEmpty) {
        newErrors.push({ field: 'email', message: 'El correo electrónico es requerido' });
      }

      return newErrors;
    });
  }

  /**
   * Validates a specific field - shows errors when touched and empty or invalid
   */
  private validateField(field: keyof AccountOpeningFormData, value: any): void {
    const rules: Record<string, (val: string) => boolean> = {
      dni: (val: string) => /^\d{8}$/.test(val), // Exactly 8 digits
      phone: (val: string) => /^\d{9}$/.test(val),
      email: (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    };

    const validator = rules[field];
    if (!validator) {
      return;
    }

    const isTouched = this.touchedFields().has(field);
    const isEmpty = !value || value.trim() === '';
    const hasValue = value && value.trim() !== '';
    
    console.log(`validateField for ${field}:`, {
      value,
      isTouched,
      isEmpty,
      hasValue,
      touchedFields: Array.from(this.touchedFields())
    });
    
    // Only validate if the field has been touched by the user
    if (!isTouched) {
      console.log(`Field ${field} not touched, skipping validation`);
      return;
    }
    
    // Clear all errors for this field first
    this.errors.update(errors => {
      const filteredErrors = errors.filter(error => error.field !== field);
      let newErrors = [...filteredErrors];
      
      // If field has value, validate format
      if (hasValue) {
        const isValid = validator(value);
        
        if (!isValid) {
          const errorMessages: Record<string, string> = {
            dni: 'El DNI debe tener 8 dígitos',
            phone: 'El celular debe tener 9 dígitos',
            email: 'Ingresa un correo electrónico válido',
          };
          newErrors.push({ field, message: errorMessages[field] || 'Error de validación' });
        }
      }
      // If field is touched and empty, show required error
      else if (isEmpty) {
        const requiredMessages: Record<string, string> = {
          dni: 'El DNI es requerido',
          phone: 'El celular es requerido',
          email: 'El correo electrónico es requerido',
        };
        newErrors.push({ field, message: requiredMessages[field] || 'Este campo es requerido' });
      }
      
      return newErrors;
    });
  }

  /**
   * Handles form submission
   */
  async onSubmit(): Promise<void> {
    if (this.isFormValid()) {
      console.log('Form submitted:', this.formData());
      console.log('reCAPTCHA token:', this.recaptchaToken());
      
      // Aquí puedes enviar todos los datos del formulario junto con el token
      const formPayload = {
        ...this.formData(),
        recaptchaToken: this.recaptchaToken()
      };
      
      console.log('Complete form payload:', formPayload);
      
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
   * Handles reCAPTCHA validation and token generation
   */
  onRecaptchaChange(event: any): void {
    // Usar la misma lógica que funciona para el checkbox de privacidad
    const valid = event.detail?.checked || event.target?.checked || false;
    console.log('🔄 reCAPTCHA checkbox changed:', valid);
    
    if (valid) {
      console.log('✅ Checkbox is checked - Generating reCAPTCHA token...');
      this.validateCaptcha();
    } else {
      console.log('❌ Checkbox is unchecked - Clearing reCAPTCHA token...');
      this.recaptchaToken.set('');
    }
  }

  /**
   * Handles reCAPTCHA click event
   */
  onRecaptchaClick(event: any): void {
    // Obtener el estado actual del checkbox
    const checkbox = event.target as any;
    const isChecked = checkbox.checked || false;
    
    console.log('🖱️ reCAPTCHA checkbox clicked, current state:', isChecked);
    
    if (isChecked) {
      console.log('✅ Checkbox is checked - Generating reCAPTCHA token...');
      this.validateCaptcha();
    } else {
      console.log('❌ Checkbox is unchecked - Clearing reCAPTCHA token...');
      this.recaptchaToken.set('');
    }
  }

  /**
   * Validates reCAPTCHA using the service
   */
  validateCaptcha(): void {
    this.captchaService.getToken('account_opening').then(token => {
      console.log('Token generado:', token);
      this.recaptchaToken.set(token);

      // Enviamos token al backend (Spring Boot)
      this.captchaService.validateToken(token)
        .subscribe(res => {
          console.log('Respuesta del backend:', res);
          // Aquí puedes manejar la respuesta del backend
        });
    }).catch(error => {
      console.error('Error generando token reCAPTCHA:', error);
    });
  }
}