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

@Component({
  selector: 'app-success-page',
  standalone: true,
  imports: [NavigationComponent, TitleSectionComponent],
  templateUrl: './success.page.html',
  styleUrl: './success.page.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SuccessPageComponent extends BaseComponent implements OnInit {
  private textService = inject(TextService);
  private identityStore = inject(IdentityStoreService);
  private router = inject(Router);

  ngOnInit(): void {
    this.textService.loadTexts('es').subscribe();

    // Navigate to home after 3 seconds
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 3000);
  }

  /**
   * Gets text by key with fallback support
   */
  getText(key: string, params?: { [key: string]: string | number }): string {
    return this.textService.getText(key, params);
  }

  /**
   * Navigates back to previous page
   */
  goBack(): void {
    this.router.navigate(['/biometria/selfie']);
  }

  /**
   * Navigates to home
   */
  goHome(): void {
    this.router.navigate(['/']);
  }
}
