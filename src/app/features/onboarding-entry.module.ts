import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OnboardingEntryComponent } from './onboarding-entry.component';

const routes: Routes = [
  {
    path: '',
    component: OnboardingEntryComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./onboarding.routes').then((m) => m.ONBOARDING_ROUTES),
      },
    ],
  },
];

@NgModule({
  declarations: [OnboardingEntryComponent],
  imports: [RouterModule.forChild(routes)],
})
export class OnboardingEntryModule {}
