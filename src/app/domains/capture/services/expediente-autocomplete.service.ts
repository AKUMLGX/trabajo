import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoggerService } from './logger.service';

// Construir la URL base correcta para Tlapohualli
// environment.baseUrl es: http://localhost:8090/akamba/api/v1/
// Necesitamos: http://localhost:8090/akamba/tlapohualli/api/v1/
// Por lo tanto, eliminamos /api/v1/ del final y agregamos /tlapohualli/api/v1/
let baseUrl = environment.baseUrl.endsWith('/') ? environment.baseUrl.slice(0, -1) : environment.baseUrl;
// Eliminar /api/v1 del final si existe (con o sin trailing slash)
baseUrl = baseUrl.replace(/\/api\/v1\/?$/, '');
// Asegurar que termine con / para la concatenación
const baseWithoutApi = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
const TLAPOHUALLI_BASE = `${baseWithoutApi}tlapohualli/api/v1/`;

@Injectable({
  providedIn: 'root'
})
export class ExpedienteAutocompleteService {
  
  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {}

  /**
   * Obtiene el siguiente número de expediente sugerido
   * Formato: Exp.001-YYYY, Exp.002-YYYY, Exp.003-YYYY...
   * Si se proporciona un oficio, verifica si ya existe y retorna su expediente
   */
  obtenerSiguienteExpediente(oficio?: string): Observable<string> {
    // Si se proporciona un oficio, primero verificar si ya existe
    if (oficio && oficio.trim()) {
      return this.obtenerExpedientePorOficio(oficio.trim()).pipe(
        catchError(() => {
          // Si no existe, obtener el siguiente expediente nuevo
          return this.obtenerSiguienteExpedienteNuevo();
        })
      );
    }
    
    // Si no hay oficio, obtener el siguiente expediente nuevo
    return this.obtenerSiguienteExpedienteNuevo();
  }

  /**
   * Obtiene el expediente asociado a un oficio (si existe)
   */
  obtenerExpedientePorOficio(oficio: string): Observable<string> {
    const url = `${TLAPOHUALLI_BASE}expedientes/por-oficio/${encodeURIComponent(oficio)}`;
    return this.http.get<{success: boolean, expediente: string}>(url, { withCredentials: true })
      .pipe(
        map(response => {
          this.logger.debug('Expediente encontrado para oficio:', oficio, response.expediente);
          return response.expediente;
        }),
        catchError(error => {
          this.logger.debug('No se encontró expediente para oficio:', oficio);
          throw error; // Propagar el error para que se maneje en obtenerSiguienteExpediente
        })
      );
  }

  /**
   * Obtiene el siguiente número de expediente nuevo (sin verificar oficio)
   */
  private obtenerSiguienteExpedienteNuevo(): Observable<string> {
    return this.http.get<{success: boolean, siguiente: string}>(`${TLAPOHUALLI_BASE}expedientes/siguiente`, { withCredentials: true })
      .pipe(
        map(response => response.siguiente),
        catchError(error => {
          this.logger.error('Error al obtener siguiente expediente:', error);
          // Fallback a LocalStorage
          const ultimoNumero = this.getUltimoNumeroLocal();
          const siguiente = ultimoNumero + 1;
          return of(this.formatearExpediente(siguiente));
        })
      );
  }

  /**
   * Obtiene expedientes recientes para autocompletar
   * @param termino - Término de búsqueda (ej: "Exp.00")
   */
  buscarExpedientes(termino: string): Observable<string[]> {
    // TODO: Conectar con el backend cuando esté listo
    // return this.http.get<string[]>(`/api/expedientes/buscar?q=${termino}`);
    
    // Por ahora retornamos valores mock
    const expedientesMock = this.getExpedientesRecientesLocal();
    const filtrados = expedientesMock.filter(exp => 
      exp.toLowerCase().includes(termino.toLowerCase())
    );
    return of(filtrados.slice(0, 5)); // Máximo 5 resultados
  }

  /**
   * Guarda el último número de expediente usado (LocalStorage temporal)
   */
  guardarUltimoExpediente(expediente: string): void {
    const numero = this.extraerNumero(expediente);
    if (numero) {
      localStorage.setItem('ultimo_expediente', numero.toString());
      
      // Guardar en lista de recientes
      const recientes = this.getExpedientesRecientesLocal();
      if (!recientes.includes(expediente)) {
        recientes.unshift(expediente);
        // Mantener solo los últimos 10
        const recientesLimitados = recientes.slice(0, 10);
        localStorage.setItem('expedientes_recientes', JSON.stringify(recientesLimitados));
      }
    }
  }

  /**
   * Formatea un número a formato de expediente: Exp.001
   */
  private formatearExpediente(numero: number): string {
    return `Exp.${numero.toString().padStart(3, '0')}`;
  }

  /**
   * Extrae el número de un expediente: "Exp.001" -> 1
   */
  private extraerNumero(expediente: string): number | null {
    const match = expediente.match(/Exp\.(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Obtiene el último número usado del LocalStorage
   */
  private getUltimoNumeroLocal(): number {
    const ultimo = localStorage.getItem('ultimo_expediente');
    return ultimo ? parseInt(ultimo, 10) : 0;
  }

  /**
   * Obtiene la lista de expedientes recientes del LocalStorage
   */
  private getExpedientesRecientesLocal(): string[] {
    const recientes = localStorage.getItem('expedientes_recientes');
    return recientes ? JSON.parse(recientes) : [];
  }

  /**
   * Valida que el expediente tenga el formato correcto
   */
  validarFormato(expediente: string): boolean {
    return /^Exp\.\d{3}$/i.test(expediente);
  }

  /**
   * Auto-formatea mientras el usuario escribe
   * Ej: Usuario escribe "123" -> retorna "Exp.123"
   */
  autoFormatear(valor: string): string {
    // Remover cualquier texto que no sea número
    const soloNumeros = valor.replace(/[^\d]/g, '');
    
    if (soloNumeros.length === 0) return '';
    if (soloNumeros.length > 3) return valor; // No modificar si ya tiene más de 3 dígitos
    
    // Formatear automáticamente
    return `Exp.${soloNumeros.padStart(3, '0')}`;
  }
}

