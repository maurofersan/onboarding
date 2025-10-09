import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-consent',
  standalone: true,
  imports: [],
  templateUrl: './consent.component.html',
  styleUrl: './consent.component.scss',
})
export class ConsentComponent {
  @Input() textPrefix: string = '';
  @Input() textHighlight: string = '';
  @Input() textSuffix: string = '';
  @Input() checked: boolean = false;
  @Output() consentChange = new EventEmitter<boolean>();

  onConsentChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.consentChange.emit(target.checked);
  }
}
