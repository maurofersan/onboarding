import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

declare const grecaptcha: any;

@Injectable({ providedIn: 'root' })
export class CaptchaService {
  private apiUrl = 'http://localhost:8080/api/captcha/validate';

  constructor(private http: HttpClient) {}

  private siteKey = '6LfMpvsrAAAAAIOOQotchf1R_vNUELAPowGL1dOB'; // Clave pública de Google

  getToken(action: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!grecaptcha) {
        reject('reCAPTCHA no está cargado');
      }

      grecaptcha.ready(() => {
        grecaptcha.execute(this.siteKey, { action }).then(
          (token: string) => resolve(token),
          (err: any) => reject(err)
        );
      });
    });
  }

  validateToken(token: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?token=${token}`);
  }
}
