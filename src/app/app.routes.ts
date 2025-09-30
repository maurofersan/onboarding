import { Routes } from '@angular/router';

import { ONBOARDING_ROUTES } from './features/onboarding.routes';

export const routes: Routes = [
  {
    path: '',
    children: ONBOARDING_ROUTES,
  },
];
