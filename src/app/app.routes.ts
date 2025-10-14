import { Routes } from '@angular/router';

import { IDENTITY_ROUTES } from './features/identity.routes';

export const routes: Routes = [
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
    redirectTo: 'account-opening-personal-data',
    pathMatch: 'full',
  },
];
