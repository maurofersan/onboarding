import { Routes } from '@angular/router';

import { IDENTITY_ROUTES } from './features/identity.routes';

export const routes: Routes = [
  {
    path: 'account-opening',
    loadComponent: () =>
      import('./features/welcome/welcome.component')
        .then(c => c.WelcomeComponent),
  },
  {
    path: 'biometria',
    children: IDENTITY_ROUTES,
  },
  {
    path: 'account-opening-personal-data',
    loadComponent: () =>
      import('./features/onboarding/pages/personal-data/personal-data.component')
        .then(c => c.PersonalDataComponent),
    data: { product: 'accounts-data-personal' }
  },
  {
    path: '',
    redirectTo: 'account-opening',
    pathMatch: 'full',
  },
];
