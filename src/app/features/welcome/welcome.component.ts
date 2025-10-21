import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  inject,
  computed,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../shared/base/base.component';
import { TextService } from '../../core/services/text.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WelcomeComponent extends BaseComponent implements OnInit {
  private readonly textService = inject(TextService);
  private readonly router = inject(Router);

  // Text signals
  readonly titlePrefix = this.textService.getTextSignal(
    'accountOpening.welcome.title.prefix'
  );
  readonly titleHighlight = this.textService.getTextSignal(
    'accountOpening.welcome.title.highlight'
  );

  readonly featureTransfer = this.textService.getTextSignal(
    'accountOpening.welcome.features.transfer'
  );
  readonly featureDigitalOps = this.textService.getTextSignal(
    'accountOpening.welcome.features.digital_ops'
  );
  readonly featureSantanderSupport = this.textService.getTextSignal(
    'accountOpening.welcome.features.santander_support'
  );

  readonly infoRecommendation = this.textService.getTextSignal(
    'accountOpening.welcome.info_recommendation'
  );

  readonly startButton = this.textService.getTextSignal(
    'accountOpening.welcome.button.start'
  );

  ngOnInit(): void {
    // Component initialization
  }

  /**
   * Handles continue button click
   */
  onContinue(): void {
    // Navigate to the next step in the flow
    this.router.navigate(['/account-opening-personal-data']);
  }
}
