import { Component, Input } from '@angular/core';
import { InstructionItem } from '../../../../shared/interfaces/identity.interfaces';

@Component({
  selector: 'app-instructions',
  standalone: true,
  imports: [],
  templateUrl: './instructions.component.html',
  styleUrl: './instructions.component.scss',
})
export class InstructionsComponent {
  @Input() instructions: InstructionItem[] = [];

  /**
   * Maps icon names to image paths
   */
  getIconPath(iconName: string): string {
    const iconMap: { [key: string]: string } = {
      dni: 'assets/images/dni.svg',
      camera: 'assets/images/mobile.svg',
      lighting: 'assets/images/light-bulb.svg',
    };

    return iconMap[iconName] || iconName;
  }
}
