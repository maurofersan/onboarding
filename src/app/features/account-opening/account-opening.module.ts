import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccountOpeningEntryComponent } from './account-opening-entry.component';

const routes: Routes = [
  {
    path: '',
    component: AccountOpeningEntryComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./account-opening.routes').then((m) => m.ACCOUNT_OPENING_ROUTES),
      },
    ],
  },
];

@NgModule({
  imports: [AccountOpeningEntryComponent, RouterModule.forChild(routes)],
})
export class AccountOpeningModule {}
