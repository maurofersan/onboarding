import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../../shared/base/base.component';
import { TextService } from '../../../../core/services/text.service';
import { IdentityStoreService } from '../../../../core/services/identity-store.service';
import { NavigationComponent } from '../../components/navigation/navigation.component';
import { TitleSectionComponent } from '../../components/title-section/title-section.component';
import { InstructionsComponent } from '../../components/instructions/instructions.component';
import { ConsentComponent } from '../../components/consent/consent.component';
import { InstructionItem } from '../../../../shared/interfaces/identity.interfaces';

@Component({
  selector: 'app-onboarding-page',
  standalone: true,
  imports: [
    NavigationComponent,
    TitleSectionComponent,
    InstructionsComponent,
    ConsentComponent,
  ],
  templateUrl: './onboarding.page.html',
  styleUrl: './onboarding.page.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OnboardingPageComponent extends BaseComponent implements OnInit {
  biometricConsent = false;

  private textService = inject(TextService);
  private identityStore = inject(IdentityStoreService);
  private router = inject(Router);

  ngOnInit(): void {
    this.textService.loadTexts('es').subscribe();
  }

  /**
   * Gets text by key with fallback support
   */
  getText(key: string, params?: { [key: string]: string | number }): string {
    return this.textService.getText(key, params);
  }

  /**
   * Gets instruction items for the onboarding
   */
  get instructions(): InstructionItem[] {
    return [
      {
        iconKey: 'dni',
        text: this.getText('identity.onboarding.instructions.dni'),
      },
      {
        iconKey: 'camera',
        text: this.getText('identity.onboarding.instructions.camera'),
      },
      {
        iconKey: 'lighting',
        text: this.getText('identity.onboarding.instructions.lighting'),
      },
    ];
  }

  /**
   * Handles biometric consent change
   */
  onConsentChange(consent: boolean): void {
    this.biometricConsent = consent;
    this.identityStore.setBiometricConsent(consent);
  }

  /**
   * Continues to the next step
   */
  continue(): void {
    this.identityStore.setCurrentStep('dni-front');
    this.router.navigate(['/biometria/dni-front']);
  }

  /**
   * Navigates back to previous page
   */
  goBack(): void {
    this.router.navigate(['/']);
  }
}
