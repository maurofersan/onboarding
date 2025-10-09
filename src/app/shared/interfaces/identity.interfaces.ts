export interface InstructionItem {
  iconKey: string;
  text: string;
}

export interface CameraConstraints {
  video: {
    facingMode: 'user' | 'environment';
    width: { ideal: number; min: number };
    height: { ideal: number; min: number };
    frameRate: { ideal: number; max: number };
    aspectRatio: number;
  };
  audio: boolean;
}

export interface IdentityState {
  currentStep: 'onboarding' | 'dni-front' | 'dni-back' | 'selfie' | 'success';
  dniFrontImage: string | null;
  dniBackImage: string | null;
  selfieImage: string | null;
  biometricConsent: boolean;
  isLoading: boolean;
  error: string | null;
}

export type CameraType = 'dni-front' | 'dni-back' | 'selfie';
