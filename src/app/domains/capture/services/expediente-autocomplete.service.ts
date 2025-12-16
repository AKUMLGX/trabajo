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
   * Formato: EXP-0001-YYYY, EXP-0002-YYYY, EXP-0003-YYYY...
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
   * @param termino - Término de búsqueda (ej: "EXP-00")
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
   * Formatea un número a formato de expediente: EXP-001-MM-YY
   * Donde MM es el mes actual (2 dígitos) y YY es el año actual (2 dígitos)
   */
  private formatearExpediente(numero: number): string {
    const ahora = new Date();
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0'); // Mes: 01-12
    const año = ahora.getFullYear() % 100; // Año a 2 dígitos: 25, 26, etc.
    const añoStr = año.toString().padStart(2, '0');
    return `EXP-${numero.toString().padStart(3, '0')}-${mes}-${añoStr}`;
  }

  /**
   * Extrae el número de un expediente: "EXP-001-12-25" -> 1
   * También maneja formatos antiguos para compatibilidad
   */
  private extraerNumero(expediente: string): number | null {
    // Formato nuevo: EXP-001-MM-YY
    const matchNuevo = expediente.match(/EXP-(\d+)-(\d{2})-(\d{2})/i);
    if (matchNuevo) {
      return parseInt(matchNuevo[1], 10);
    }
    // Formato intermedio: EXP-0001-YYYY
    const matchIntermedio = expediente.match(/EXP-(\d+)-(\d{4})/i);
    if (matchIntermedio) {
      return parseInt(matchIntermedio[1], 10);
    }
    // Formato antiguo: Exp.001-YYYY o Exp.001 (compatibilidad)
    const matchAntiguo = expediente.match(/Exp\.(\d+)/i);
    return matchAntiguo ? parseInt(matchAntiguo[1], 10) : null;
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
   * Formato nuevo: EXP-001-MM-YY (donde MM es mes y YY es año a 2 dígitos)
   * También acepta formatos antiguos para compatibilidad
   */
  validarFormato(expediente: string): boolean {
    const ahora = new Date();
    const mesActual = (ahora.getMonth() + 1).toString().padStart(2, '0');
    const añoActual = (ahora.getFullYear() % 100).toString().padStart(2, '0');
    
    // Formato nuevo: EXP-001-MM-YY
    const formatoNuevo = new RegExp(`^EXP-\\d{3}-${mesActual}-${añoActual}$`, 'i');
    // Formato intermedio: EXP-0001-YYYY (compatibilidad)
    const añoCompleto = ahora.getFullYear();
    const formatoIntermedio = new RegExp(`^EXP-\\d{4}-${añoCompleto}$`, 'i');
    // Formato antiguo: Exp.001-YYYY o Exp.001 (compatibilidad)
    const formatoAntiguo = /^Exp\.\d{3}(-\d{4})?$/i;
    
    return formatoNuevo.test(expediente) || formatoIntermedio.test(expediente) || formatoAntiguo.test(expediente);
  }

  /**
   * Auto-formatea mientras el usuario escribe
   * Ej: Usuario escribe "123" -> retorna "EXP-123-12-25"
   */
  autoFormatear(valor: string): string {
    // Remover cualquier texto que no sea número
    const soloNumeros = valor.replace(/[^\d]/g, '');
    
    if (soloNumeros.length === 0) return '';
    if (soloNumeros.length > 3) return valor; // No modificar si ya tiene más de 3 dígitos
    
    const ahora = new Date();
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
    const año = (ahora.getFullYear() % 100).toString().padStart(2, '0');
    // Formatear automáticamente al nuevo formato: EXP-001-MM-YY
    return `EXP-${soloNumeros.padStart(3, '0')}-${mes}-${año}`;
  }
}

