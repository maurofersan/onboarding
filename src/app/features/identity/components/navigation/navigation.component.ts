import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {
  @Input() backButtonText: string = 'Volver';
  @Input() disabled: boolean = false;
  @Output() backClick = new EventEmitter<void>();

  onBackClick(): void {
    if (!this.disabled) {
      this.backClick.emit();
    }
  }
}
