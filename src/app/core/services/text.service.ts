import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Texts {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class TextService {
  private texts: Texts = {};
  private currentLanguage = 'es';

  constructor(private http: HttpClient) {}

  /**
   * Gets text by key with fallback support
   */
  getText(key: string, params?: { [key: string]: string | number }): string {
    const text = this.getNestedProperty(this.texts, key) || key;
    return this.interpolateParams(text, params);
  }

  /**
   * Loads texts from API with fallback to local assets
   */
  loadTexts(language: string = 'es'): Observable<Texts> {
    this.currentLanguage = language;

    return this.http.get<Texts>(`/assets/i18n/${language}.json`).pipe(
      map((texts) => {
        this.texts = { ...this.texts, ...texts };
        return this.texts;
      })
    );
  }

  /**
   * Sets current language
   */
  setLanguage(language: string): void {
    this.currentLanguage = language;
    this.loadTexts(language);
  }

  /**
   * Gets current language
   */
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  private getNestedProperty(obj: any, path: string): string {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private interpolateParams(
    text: string,
    params?: { [key: string]: string | number }
  ): string {
    if (!params) return text;

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key]?.toString() || match;
    });
  }
}
