import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-onboarding',
  imports: [RouterOutlet],
  template: `
    <h1>Onboarding Flow</h1>
    <router-outlet></router-outlet>
  `,
})
export class OnboardingComponent {}
