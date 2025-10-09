import { Routes } from '@angular/router';

export const IDENTITY_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'onboarding',
    pathMatch: 'full',
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./identity/pages/onboarding/onboarding.page').then(
        (m) => m.OnboardingPageComponent
      ),
  },
  {
    path: 'dni-front',
    loadComponent: () =>
      import('./identity/pages/dni-front/dni-front.page').then(
        (m) => m.DniFrontPageComponent
      ),
  },
  {
    path: 'dni-back',
    loadComponent: () =>
      import('./identity/pages/dni-back/dni-back.page').then(
        (m) => m.DniBackPageComponent
      ),
  },
  {
    path: 'selfie',
    loadComponent: () =>
      import('./identity/pages/selfie/selfie.page').then(
        (m) => m.SelfiePageComponent
      ),
  },
  {
    path: 'success',
    loadComponent: () =>
      import('./identity/pages/success/success.page').then(
        (m) => m.SuccessPageComponent
      ),
  },
];
