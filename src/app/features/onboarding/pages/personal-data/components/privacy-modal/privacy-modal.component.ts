import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextService } from '../../../../../../core/services/text.service';

@Component({
  selector: 'app-privacy-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-modal.component.html',
  styleUrl: './privacy-modal.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrivacyModalComponent {
  private readonly textService = inject(TextService);

  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() accept = new EventEmitter<void>();

  // Text getters
  readonly title = this.textService.getText('accountOpening.welcome.form.privacy.modal.title');
  readonly question = this.textService.getText('accountOpening.welcome.form.privacy.modal.content.question');
  readonly intro = this.textService.getText('accountOpening.welcome.form.privacy.modal.content.intro');
  readonly point1 = this.textService.getText('accountOpening.welcome.form.privacy.modal.content.point1');
  readonly point2 = this.textService.getText('accountOpening.welcome.form.privacy.modal.content.point2');
  readonly point2a = this.textService.getText('accountOpening.welcome.form.privacy.modal.content.point2a');
  readonly point2b = this.textService.getText('accountOpening.welcome.form.privacy.modal.content.point2b');
  readonly point3 = this.textService.getText('accountOpening.welcome.form.privacy.modal.content.point3');
  readonly point3a = this.textService.getText('accountOpening.welcome.form.privacy.modal.content.point3a');
  readonly point3b = this.textService.getText('accountOpening.welcome.form.privacy.modal.content.point3b');
  readonly point3c = this.textService.getText('accountOpening.welcome.form.privacy.modal.content.point3c');
  readonly point4 = this.textService.getText('accountOpening.welcome.form.privacy.modal.content.point4');
  readonly point5 = this.textService.getText('accountOpening.welcome.form.privacy.modal.content.point5');
  readonly point6 = this.textService.getText('accountOpening.welcome.form.privacy.modal.content.point6');
  readonly point7 = this.textService.getText('accountOpening.welcome.form.privacy.modal.content.point7');
  readonly point8 = this.textService.getText('accountOpening.welcome.form.privacy.modal.content.point8');
  readonly point9 = this.textService.getText('accountOpening.welcome.form.privacy.modal.content.point9');
  readonly signature = this.textService.getText('accountOpening.welcome.form.privacy.modal.content.signature');
  readonly buttonText = this.textService.getText('accountOpening.welcome.form.privacy.modal.button');

  onClose(): void {
    this.close.emit();
  }

  onAccept(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.accept.emit();
  }

  onOverlayClick(): void {
    this.onClose();
  }
}
