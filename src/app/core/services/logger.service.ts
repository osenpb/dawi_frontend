import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private isDev = !environment.production;

  log(...args: unknown[]): void {
    if (this.isDev) console.log(...args);
  }

  error(...args: unknown[]): void {
    if (this.isDev) console.error(...args);
  }

  warn(...args: unknown[]): void {
    if (this.isDev) console.warn(...args);
  }
}
