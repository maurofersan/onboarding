import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  TextParams,
  TextData,
  LanguageConfig,
  ITextAccessor,
} from './text.interfaces';

/**
 * Main text service using Angular signals.
 * Handles loading, interpolation, and reactive access to text data.
 */
@Injectable({
  providedIn: 'root',
})
export class TextService implements ITextAccessor {
  private readonly http = inject(HttpClient);

  // Reactive state using signals
  private readonly texts = signal<TextData>({});
  private readonly currentLanguage = signal<string>('es');
  private readonly isLoading = signal<boolean>(false);
  private readonly error = signal<string | null>(null);

  // Language configuration
  private readonly languageConfig: LanguageConfig = {
    defaultLanguage: 'es',
    supportedLanguages: ['es', 'en'] as const,
  };

  // Computed signals for efficient state access
  readonly textsSignal = this.texts.asReadonly();
  readonly currentLanguageSignal = this.currentLanguage.asReadonly();
  readonly isLoadingSignal = this.isLoading.asReadonly();
  readonly errorSignal = this.error.asReadonly();

  /**
   * Loads the text data for a specific language.
   * @param language - Language to load.
   */
  async loadTexts(
    language: string = this.languageConfig.defaultLanguage
  ): Promise<void> {
    if (!this.isValidLanguage(language)) {
      console.warn(
        `Unsupported language: ${language}. Using default: ${this.languageConfig.defaultLanguage}`
      );
      language = this.languageConfig.defaultLanguage;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const loadedTexts = await this.loadTextsFromAssets(language);
      this.texts.set(loadedTexts);
      this.currentLanguage.set(language);
    } catch (err) {
      const errorMessage = `Failed to load texts for language: ${language}`;
      this.error.set(errorMessage);
      console.error(errorMessage, err);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Retrieves a text value by key with optional parameter interpolation.
   * @param key - Text key (supports dot notation for nested objects).
   * @param params - Parameters for interpolation.
   * @returns Interpolated text or the key itself if not found.
   */
  getText(key: string, params?: TextParams): string {
    const text = this.getNestedProperty(this.texts(), key) || key;
    return this.interpolateParams(text, params);
  }

  /**
   * Computed signal to get a specific text reactively.
   * @param key - Text key.
   * @returns Computed signal that returns the text.
   */
  getTextSignal(key: string) {
    return computed(() => {
      const text = this.getNestedProperty(this.texts(), key) || key;
      return text;
    });
  }

  /**
   * Computed signal to get a text with interpolated parameters.
   * @param key - Text key.
   * @param params - Parameters for interpolation.
   * @returns Computed signal that returns the interpolated text.
   */
  getTextWithParamsSignal(key: string, params?: TextParams) {
    return computed(() => {
      const text = this.getNestedProperty(this.texts(), key) || key;
      return this.interpolateParams(text, params);
    });
  }

  /**
   * Changes the current language and reloads text data.
   * @param language - New language.
   */
  async setLanguage(language: string): Promise<void> {
    if (language !== this.currentLanguage()) {
      await this.loadTexts(language);
    }
  }

  /**
   * Gets the currently active language.
   * @returns The current language code.
   */
  getCurrentLanguage(): string {
    return this.currentLanguage();
  }

  /**
   * Loads text data from assets using HTTP.
   * @param language - Language to load.
   * @returns Promise resolving to the loaded text data.
   */
  private async loadTextsFromAssets(language: string): Promise<TextData> {
    try {
      return await firstValueFrom(
        this.http.get<TextData>(`/assets/i18n/${language}.json`)
      );
    } catch (error) {
      console.error(`Error loading texts for language ${language}:`, error);
      return {};
    }
  }

  /**
   * Performs parameter interpolation within a text string.
   * @param text - Text to interpolate.
   * @param params - Parameters for interpolation.
   * @returns Interpolated text.
   */
  private interpolateParams(text: string, params?: TextParams): string {
    if (!params) return text;

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }

  /**
   * Checks whether a given language is valid.
   * @param language - Language to check.
   * @returns true if the language is supported.
   */
  private isValidLanguage(language: string): boolean {
    return this.languageConfig.supportedLanguages.includes(language as any);
  }

  /**
   * Retrieves a nested property from an object using dot notation.
   * @param obj - Source object.
   * @param path - Property path (e.g., 'user.profile.name').
   * @returns The value or undefined if not found.
   */
  private getNestedProperty(obj: TextData, path: string): string | undefined {
    return path.split('.').reduce((current: any, key: string) => {
      return current?.[key];
    }, obj) as string | undefined;
  }
}
