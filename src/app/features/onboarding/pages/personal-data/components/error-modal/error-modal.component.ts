import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextService } from '../../../../../../core/services/text.service';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-modal.component.html',
  styleUrl: './error-modal.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ErrorModalComponent {
  private readonly textService = inject(TextService);

  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();

  // Text signals
  readonly title = this.textService.getTextSignal('accountOpening.welcome.errorModal.title');
  readonly message = this.textService.getTextSignal('accountOpening.welcome.errorModal.message');
  readonly retryButton = this.textService.getTextSignal('accountOpening.welcome.errorModal.retryButton');
  readonly findAgencyLink = this.textService.getTextSignal('accountOpening.welcome.errorModal.findAgencyLink');

  onClose(): void {
    this.close.emit();
  }

  onOverlayClick(): void {
    this.onClose();
  }

  onFindAgencyClick(): void {
    // Abrir enlace en una nueva pestaña
    window.open('https://www.santander.com.pe/agencias', '_blank');
  }
}
