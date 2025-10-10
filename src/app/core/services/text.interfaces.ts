export interface TextParams {
  readonly [key: string]: string | number;
}

export interface TextData {
  readonly [key: string]: any;
}

export interface LanguageConfig {
  readonly defaultLanguage: string;
  readonly supportedLanguages: readonly string[];
}

export interface ITextAccessor {
  getText(key: string, params?: TextParams): string;
}
