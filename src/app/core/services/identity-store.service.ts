import { Injectable, signal, computed } from '@angular/core';
import { IdentityState } from '../../shared/interfaces/identity.interfaces';

const initialState: IdentityState = {
  currentStep: 'onboarding',
  dniFrontImage: null,
  dniBackImage: null,
  selfieImage: null,
  biometricConsent: false,
  isLoading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class IdentityStoreService {
  private _state = signal<IdentityState>(initialState);

  // Getters
  readonly state = this._state.asReadonly();
  readonly currentStep = computed(() => this._state().currentStep);
  readonly dniFrontImage = computed(() => this._state().dniFrontImage);
  readonly dniBackImage = computed(() => this._state().dniBackImage);
  readonly selfieImage = computed(() => this._state().selfieImage);
  readonly biometricConsent = computed(() => this._state().biometricConsent);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);

  // Actions
  setCurrentStep(step: IdentityState['currentStep']): void {
    this._state.update((state) => ({ ...state, currentStep: step }));
  }

  setDniFrontImage(image: string | null): void {
    this._state.update((state) => ({ ...state, dniFrontImage: image }));
  }

  setDniBackImage(image: string | null): void {
    this._state.update((state) => ({ ...state, dniBackImage: image }));
  }

  setSelfieImage(image: string | null): void {
    this._state.update((state) => ({ ...state, selfieImage: image }));
  }

  setBiometricConsent(consent: boolean): void {
    this._state.update((state) => ({ ...state, biometricConsent: consent }));
  }

  setLoading(loading: boolean): void {
    this._state.update((state) => ({ ...state, isLoading: loading }));
  }

  setError(error: string | null): void {
    this._state.update((state) => ({ ...state, error }));
  }

  clearError(): void {
    this._state.update((state) => ({ ...state, error: null }));
  }

  reset(): void {
    this._state.set(initialState);
  }

  // Computed values
  readonly isDniFrontComplete = computed(() => !!this._state().dniFrontImage);
  readonly isDniBackComplete = computed(() => !!this._state().dniBackImage);
  readonly isSelfieComplete = computed(() => !!this._state().selfieImage);
  readonly isIdentityComplete = computed(
    () =>
      this.isDniFrontComplete() &&
      this.isDniBackComplete() &&
      this.isSelfieComplete()
  );
}

