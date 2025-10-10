import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TextService } from './core/services/text.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit {
  private readonly textService = inject(TextService);

  title = 'identity';

  async ngOnInit(): Promise<void> {
    await this.textService.loadTexts();
  }
}
