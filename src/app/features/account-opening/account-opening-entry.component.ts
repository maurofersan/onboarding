import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-account-opening-entry',
  standalone: true,
  template: '<router-outlet></router-outlet>',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AccountOpeningEntryComponent {}
