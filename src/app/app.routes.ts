import { Routes } from '@angular/router';

import { IDENTITY_ROUTES } from './features/identity.routes';

export const routes: Routes = [
  {
    path: 'biometria',
    children: IDENTITY_ROUTES,
  },
  {
    path: '',
    redirectTo: 'biometria',
    pathMatch: 'full',
  },
];
