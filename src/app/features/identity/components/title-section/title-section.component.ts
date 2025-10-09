import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-title-section',
  standalone: true,
  imports: [],
  templateUrl: './title-section.component.html',
  styleUrl: './title-section.component.scss',
})
export class TitleSectionComponent {
  @Input() titlePrefix: string = '';
  @Input() titleHighlight: string = '';
  @Input() titleSufix?: string = '';
  @Input() subtitle?: string = '';
  @Input() showSuccessIcon: boolean = false;
  @Input() successIcon: string = '✓';
}
