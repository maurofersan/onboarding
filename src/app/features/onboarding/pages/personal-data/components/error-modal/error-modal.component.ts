import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-modal.component.html',
  styleUrl: './error-modal.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ErrorModalComponent {
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onOverlayClick(): void {
    this.onClose();
  }
}
