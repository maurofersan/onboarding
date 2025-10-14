export interface AccountOpeningFormData {
  dni: string;
  phone: string;
  email: string;
  taxDeclaration: boolean;
  privacyAccepted: boolean;
  recaptchaValid: boolean;
}

export interface FormFieldError {
  field: keyof AccountOpeningFormData;
  message: string;
}

export interface TaxDeclarationOption {
  value: boolean;
  label: string;
}

export interface ValidationRule {
  field: keyof AccountOpeningFormData;
  validator: (value: any) => boolean;
  errorMessage: string;
}

export interface AccountOpeningState {
  formData: Partial<AccountOpeningFormData>;
  errors: FormFieldError[];
  isValid: boolean;
  isLoading: boolean;
}
