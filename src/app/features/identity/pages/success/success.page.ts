import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../../shared/base/base.component';
import { TextService } from '../../../../core/services/text.service';
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
}
