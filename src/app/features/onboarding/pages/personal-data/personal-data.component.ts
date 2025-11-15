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
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
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
import { AccountOpeningApiService } from '../../../../core/services/account-opening-api.service';

@Component({
  selector: 'app-personal-data',
  standalone: true,
  imports: [TaxDeclarationToggleComponent, FormFieldComponent, ErrorModalComponent, PrivacyModalComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './personal-data.component.html',
  styleUrl: './personal-data.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PersonalDataComponent extends BaseComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private readonly textService = inject(TextService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly captchaService = inject(CaptchaService);
  private readonly accountOpeningApiService = inject(AccountOpeningApiService);

  // FormGroup para el email
  emailForm!: FormGroup;

  // Signals para rastrear la validez de los campos en tiempo real
  emailValid = signal<boolean>(false);
  dniValid = signal<boolean>(false);
  phoneValid = signal<boolean>(false);

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
  // Lock recaptcha after success
  recaptchaLocked = signal<boolean>(false);
  // Track reCAPTCHA checkbox state
  recaptchaChecked = signal<boolean>(false);


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
      this.dniValid() &&
      data.phone &&
      this.phoneValid() &&
      data.email &&
      this.emailValid() &&
      data.privacyAccepted &&
      this.recaptchaToken() !== '' &&
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

    // Suscribirse a los cambios del email para actualizar el signal en tiempo real
    const emailControl = this.emailForm.get('email');
    if (emailControl) {
      // Suscribirse a valueChanges para capturar cambios en el valor
      emailControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.emailValid.set(emailControl.valid);
        });
      
      // También suscribirse a statusChanges para capturar cambios en la validación
      emailControl.statusChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.emailValid.set(emailControl.valid);
        });
      
      // Actualizar el estado inicial
      this.emailValid.set(emailControl.valid);
      
      // Si hay un valor inicial en formData, establecerlo
      const initialEmail = this.formData().email;
      if (initialEmail) {
        emailControl.setValue(initialEmail, { emitEvent: false });
        this.emailValid.set(emailControl.valid);
      }
    }
    
    // Inicializar validaciones de DNI y Celular si hay valores iniciales
    const initialDni = this.formData().dni;
    if (initialDni) {
      this.validateDniRealtime(initialDni);
    }
    
    const initialPhone = this.formData().phone;
    if (initialPhone) {
      this.validatePhoneRealtime(initialPhone);
    }
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
    
    // Validar en tiempo real para DNI y Celular
    if (field === 'dni') {
      this.validateDniRealtime(value);
    } else if (field === 'phone') {
      this.validatePhoneRealtime(value);
    }
  }

  /**
   * Validates DNI in real-time
   * Actualiza el signal de validez siempre, pero solo muestra errores si el campo ha sido tocado
   */
  private validateDniRealtime(value: string): void {
    const hasValue = value && value.trim() !== '';
    const isValid = hasValue ? /^\d{8}$/.test(value) : false;
    
    // Actualizar el signal de validez siempre (para deshabilitar el botón)
    this.dniValid.set(isValid);
    
    // Solo actualizar errores si el campo ha sido tocado
    if (this.touchedFields().has('dni')) {
      this.errors.update(errors => {
        const filteredErrors = errors.filter(error => error.field !== 'dni');
        let newErrors = [...filteredErrors];
        
        if (!hasValue) {
          newErrors.push({ field: 'dni', message: 'El DNI es requerido' });
        } else if (!isValid) {
          newErrors.push({ field: 'dni', message: 'El DNI debe tener 8 dígitos' });
        }
        
        return newErrors;
      });
    }
  }

  /**
   * Validates Phone in real-time
   * Actualiza el signal de validez siempre, pero solo muestra errores si el campo ha sido tocado
   */
  private validatePhoneRealtime(value: string): void {
    const hasValue = value && value.trim() !== '';
    const isValid = hasValue ? /^\d{9}$/.test(value) : false;
    
    // Actualizar el signal de validez siempre (para deshabilitar el botón)
    this.phoneValid.set(isValid);
    
    // Solo actualizar errores si el campo ha sido tocado
    if (this.touchedFields().has('phone')) {
      this.errors.update(errors => {
        const filteredErrors = errors.filter(error => error.field !== 'phone');
        let newErrors = [...filteredErrors];
        
        if (!hasValue) {
          newErrors.push({ field: 'phone', message: 'El celular es requerido' });
        } else if (!isValid) {
          newErrors.push({ field: 'phone', message: 'El celular debe tener 9 dígitos' });
        }
        
        return newErrors;
      });
    }
  }

  updateEmailField(value: string): void {
    console.log('updateEmailField called with value:', value);
    
    // Actualizar el FormControl con validación en tiempo real
    const emailControl = this.emailForm.get('email');
    if (emailControl) {
      emailControl.setValue(value, { emitEvent: true });
      // Marcar como touched y dirty para activar validación en tiempo real
      emailControl.markAsTouched();
      emailControl.markAsDirty();
      // Actualizar el estado del formulario para que la validación se ejecute
      emailControl.updateValueAndValidity({ emitEvent: true });
      // Actualizar el signal de validez (valueChanges ya lo hará, pero esto asegura sincronización)
      this.emailValid.set(emailControl.valid);
    }
    
    // Actualizar el formData
    this.updateField('email', value);
    
    // Log del estado
    console.log('Email FormControl state:', {
      value: emailControl?.value,
      invalid: emailControl?.invalid,
      valid: emailControl?.valid,
      touched: emailControl?.touched,
      dirty: emailControl?.dirty,
      errors: emailControl?.errors
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
    // Validar en tiempo real cuando se enfoca para actualizar el estado del botón
    const currentValue = this.formData().dni || '';
    this.validateDniRealtime(currentValue);
  }

  /**
   * Handles DNI blur event for validation
   */
  onDniBlur(value: string): void {
    console.log('onDniBlur called with value:', value);
    // Validar en tiempo real también en blur
    this.validateDniRealtime(value);
    this.validateDniOnBlur(value);
  }

  /**
   * Handles phone focus event
   */
  onPhoneFocus(): void {
    this.onFieldFocus('phone');
    // Validar en tiempo real cuando se enfoca para actualizar el estado del botón
    const currentValue = this.formData().phone || '';
    this.validatePhoneRealtime(currentValue);
  }

  /**
   * Handles phone blur event for validation
   */
  onPhoneBlur(value: string): void {
    console.log('onPhoneBlur called with value:', value);
    // Validar en tiempo real también en blur
    this.validatePhoneRealtime(value);
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
    console.log('🔍 onPrivacyChange event received:', event);
    console.log('🔍 Event detail:', event.detail);
    console.log('🔍 Event target:', event.target);
    
    // Intentar obtener el valor del checkbox de múltiples formas
    let accepted = false;
    
    // Método 1: desde event.detail.checked
    if (event.detail !== undefined && event.detail.checked !== undefined) {
      accepted = event.detail.checked;
      console.log('✅ Got value from event.detail.checked:', accepted);
    }
    // Método 2: desde event.target.checked
    else if (event.target?.checked !== undefined) {
      accepted = event.target.checked;
      console.log('✅ Got value from event.target.checked:', accepted);
    }
    // Método 3: desde event.detail directamente (si es boolean)
    else if (typeof event.detail === 'boolean') {
      accepted = event.detail;
      console.log('✅ Got value from event.detail (boolean):', accepted);
    }
    // Método 4: desde event.target directamente
    else if (event.target && typeof event.target === 'object') {
      // Intentar obtener el valor actual del checkbox desde el DOM
      const checkbox = event.target as HTMLElement;
      const nativeCheckbox = checkbox.querySelector?.('input[type="checkbox"]') as HTMLInputElement;
      if (nativeCheckbox) {
        accepted = nativeCheckbox.checked;
        console.log('✅ Got value from native checkbox:', accepted);
      } else {
        // Si es un elemento std-checkbox, intentar obtener el valor desde el componente
        const stdCheckbox = checkbox as any;
        if (stdCheckbox.checked !== undefined) {
          accepted = stdCheckbox.checked;
          console.log('✅ Got value from std-checkbox.checked:', accepted);
        } else if (stdCheckbox.value !== undefined) {
          accepted = stdCheckbox.value;
          console.log('✅ Got value from std-checkbox.value:', accepted);
        }
      }
    }
    // Método 5: invertir el valor actual si no podemos obtenerlo del evento
    else {
      // Si no podemos obtener el valor del evento, usar el valor opuesto del estado actual
      accepted = !this.formData().privacyAccepted;
      console.log('⚠️ Could not get value from event, toggling current value:', accepted);
    }
    
    console.log('✅ Final accepted value:', accepted);
    console.log('📊 Current formData().privacyAccepted:', this.formData().privacyAccepted);
    
    // Actualizar el campo
    this.updateField('privacyAccepted', accepted);
    
    // Validar el checkbox
    this.validatePrivacyCheckbox(accepted);
    
    // Verificar que se actualizó correctamente
    setTimeout(() => {
      const currentValue = this.formData().privacyAccepted;
      console.log('✅ After update, formData().privacyAccepted:', currentValue);
      console.log('✅ Has error:', this.hasFieldError('privacyAccepted')());
      this.applyCheckboxErrorStyles();
    }, 0);
    
    // Segundo intento después de un pequeño delay
    setTimeout(() => {
      this.applyCheckboxErrorStyles();
    }, 100);
  }

  /**
   * Handles privacy checkbox click event
   * Este método asegura que el checkbox se actualice correctamente cuando el usuario hace clic
   */
  onPrivacyClick(event: any): void {
    // Pequeño delay para permitir que el componente std-checkbox actualice su estado interno primero
    setTimeout(() => {
      console.log('🖱️ Privacy checkbox clicked, current state:', this.formData().privacyAccepted);
      
      // Intentar obtener el valor del checkbox desde el DOM
      const checkboxElement = event.target as any;
      let checked = false;
      
      // Intentar diferentes métodos para obtener el valor
      if (checkboxElement?.checked !== undefined) {
        checked = checkboxElement.checked;
      } else if (checkboxElement?.shadowRoot) {
        const input = checkboxElement.shadowRoot.querySelector('input[type="checkbox"]');
        if (input) {
          checked = (input as HTMLInputElement).checked;
        }
      } else {
        // Si no podemos obtener el valor, togglear el estado actual
        checked = !this.formData().privacyAccepted;
      }
      
      console.log('✅ Checkbox checked value:', checked);
      console.log('📊 Current formData().privacyAccepted:', this.formData().privacyAccepted);
      
      // Solo actualizar si el valor es diferente
      if (checked !== this.formData().privacyAccepted) {
        console.log('🔄 Updating privacyAccepted from', this.formData().privacyAccepted, 'to', checked);
        this.updateField('privacyAccepted', checked);
        this.validatePrivacyCheckbox(checked);
        
        // Verificar después de actualizar
        setTimeout(() => {
          console.log('✅ After update, formData().privacyAccepted:', this.formData().privacyAccepted);
          console.log('✅ Has error:', this.hasFieldError('privacyAccepted')());
        }, 50);
      }
    }, 10);
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
    const formData = this.formData();
    
    // Validar todos los campos antes de enviar
    this.validateFormBeforeSubmit();
    
    // Verificar si el formulario es válido después de la validación
    if (!this.isFormValid()) {
      console.log('Form is not valid, cannot submit');
      console.log('Form data:', formData);
      console.log('Errors:', this.errors());
      
      // Mostrar errores específicos
      if (!formData.privacyAccepted) {
        console.warn('⚠️ El checkbox de políticas de privacidad debe estar marcado');
      }
      return;
    }

    console.log('Form submitted:', formData);
    console.log('reCAPTCHA token:', this.recaptchaToken());

    // Preparar el payload para la API según el formato de Postman
    const apiRequest = {
      documentType: '0ed651ca-908b-4f83-9626-d6b4740497e7', // UUID fijo según la imagen de Postman
      documentNumber: formData.dni || '',
      phoneNumber: formData.phone || '',
      email: formData.email || '',
      isPeruvian: formData.taxDeclaration ? 'S' : 'N', // Convertir boolean a "S" o "N"
      acceptedPrivacyPolicy: formData.privacyAccepted ? 'S' : 'N', // Convertir boolean a "S" o "N"
    };

    console.log('API Request payload:', apiRequest);

    try {
      // Consumir el servicio de API
      this.accountOpeningApiService.createAccount(apiRequest).subscribe({
        next: (response) => {
          console.log('✅ API Response received:', response);
          console.log('✅ Success! La respuesta se muestra en DevTools Network');
          // La respuesta se mostrará automáticamente en DevTools Network
        },
        error: (error) => {
          console.error('❌ API Error:', error);
          
          // Información detallada del error
          if (error.status === 0) {
            console.error('❌ Error de conexión: El servidor no está disponible o hay un problema de CORS');
            console.error('💡 Asegúrate de que el servidor esté corriendo en http://localhost:3000');
          } else if (error.status === 404) {
            console.error('❌ Error 404: El endpoint no existe');
            console.error('💡 Verifica que la ruta /redis/create esté configurada en el servidor');
          } else if (error.status === 405) {
            console.error('❌ Error 405: Método no permitido');
            console.error('💡 El servidor no acepta peticiones POST en este endpoint');
          } else {
            console.error(`❌ Error ${error.status}: ${error.message || 'Error desconocido'}`);
          }
          
          console.error('Error completo:', error);
        },
      });
    } catch (error) {
      console.error('Error calling API:', error);
    }
  }

  /**
   * Valida todos los campos del formulario antes de enviar
   */
  private validateFormBeforeSubmit(): void {
    const data = this.formData();
    
    // Validar DNI
    if (!data.dni || !/^\d{8}$/.test(data.dni)) {
      this.errors.update(errors => {
        const filtered = errors.filter(e => e.field !== 'dni');
        if (!data.dni) {
          return [...filtered, { field: 'dni' as keyof AccountOpeningFormData, message: 'El DNI es requerido' }];
        } else {
          return [...filtered, { field: 'dni' as keyof AccountOpeningFormData, message: 'El DNI debe tener 8 dígitos' }];
        }
      });
    } else {
      // Limpiar error si el DNI es válido
      this.errors.update(errors => errors.filter(e => e.field !== 'dni'));
    }
    
    // Validar teléfono
    if (!data.phone || !/^\d{9}$/.test(data.phone)) {
      this.errors.update(errors => {
        const filtered = errors.filter(e => e.field !== 'phone');
        if (!data.phone) {
          return [...filtered, { field: 'phone' as keyof AccountOpeningFormData, message: 'El celular es requerido' }];
        } else {
          return [...filtered, { field: 'phone' as keyof AccountOpeningFormData, message: 'El celular debe tener 9 dígitos' }];
        }
      });
    } else {
      // Limpiar error si el teléfono es válido
      this.errors.update(errors => errors.filter(e => e.field !== 'phone'));
    }
    
    // Validar email
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      this.errors.update(errors => {
        const filtered = errors.filter(e => e.field !== 'email');
        if (!data.email) {
          return [...filtered, { field: 'email' as keyof AccountOpeningFormData, message: 'El correo electrónico es requerido' }];
        } else {
          return [...filtered, { field: 'email' as keyof AccountOpeningFormData, message: 'Ingresa un correo electrónico válido' }];
        }
      });
    } else {
      // Limpiar error si el email es válido
      this.errors.update(errors => errors.filter(e => e.field !== 'email'));
    }
    
    // Validar checkbox de privacidad
    this.validatePrivacyCheckbox(data.privacyAccepted || false);
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
    // Restaurar el botón "Sí" cuando se cierra el modal
    this.updateField('taxDeclaration', true);
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
    
    // Actualizar el estado del checkbox
    this.recaptchaChecked.set(valid);
    
    if (valid) {
      console.log('✅ Checkbox is checked - Generating reCAPTCHA token...');
      this.validateCaptcha();
      this.recaptchaLocked.set(true);
    } else {
      console.log('❌ Checkbox is unchecked - Clearing reCAPTCHA token...');
      this.recaptchaToken.set('');
      this.recaptchaLocked.set(false);
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
    
    // Actualizar el estado del checkbox
    this.recaptchaChecked.set(isChecked);
    
    if (isChecked) {
      console.log('✅ Checkbox is checked - Generating reCAPTCHA token...');
      this.validateCaptcha();
      this.recaptchaLocked.set(true);
    } else {
      console.log('❌ Checkbox is unchecked - Clearing reCAPTCHA token...');
      this.recaptchaToken.set('');
      this.recaptchaLocked.set(false);
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