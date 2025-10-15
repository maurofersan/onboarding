import {
  Component,
  Input,
  Output,
  EventEmitter,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextService } from '../../../../core/services/text.service';

export interface TaxDeclarationOption {
  value: boolean;
  label: string;
}

@Component({
  selector: 'app-tax-declaration-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tax-declaration-toggle.component.html',
  styleUrl: './tax-declaration-toggle.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TaxDeclarationToggleComponent {
  private readonly textService = inject(TextService);

  @Input() value: boolean = false;
  @Output() valueChange = new EventEmitter<boolean>();

  readonly question = this.textService.getTextSignal(
    'accountOpening.welcome.form.taxDeclaration.question'
  );
  readonly noLabel = this.textService.getTextSignal(
    'accountOpening.welcome.form.taxDeclaration.no'
  );
  readonly yesLabel = this.textService.getTextSignal(
    'accountOpening.welcome.form.taxDeclaration.yes'
  );

  readonly options = computed<TaxDeclarationOption[]>(() => [
    { value: true, label: this.yesLabel() },
    { value: false, label: this.noLabel() },
  ]);

  onOptionSelect(optionValue: boolean): void {
    this.value = optionValue;
    this.valueChange.emit(optionValue);
  }
}
