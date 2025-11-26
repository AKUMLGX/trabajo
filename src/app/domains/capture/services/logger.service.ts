import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

/**
 * Servicio de logging centralizado
 * Permite controlar los logs según el entorno (desarrollo/producción)
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly isDevelopment = environment.environment === 'DESARROLLO' || environment.environment === 'development';

  /**
   * Log de información (solo en desarrollo)
   */
  log(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`[LOG] ${message}`, ...args);
    }
  }

  /**
   * Log de error (siempre visible)
   */
  error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }

  /**
   * Log de advertencia (solo en desarrollo)
   */
  warn(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  /**
   * Log de información importante (siempre visible)
   */
  info(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log de debug (solo en desarrollo)
   */
  debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
}

