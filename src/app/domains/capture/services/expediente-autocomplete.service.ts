import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoggerService } from './logger.service';
import { ApiService } from './api.service';
// URL base del backend: environment.baseUrl = http://localhost:8090/tlalcalli/api/v1/
const TLALCALLI_BASE = environment.baseUrl.endsWith('/') ? environment.baseUrl : `${environment.baseUrl}/`;

@Injectable({
  providedIn: 'root'
})
export class ExpedienteAutocompleteService {
  
  constructor(
    private http: HttpClient,
    private logger: LoggerService,
    private apiservice : ApiService
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
    const url = `${TLALCALLI_BASE}expedientes/por-oficio/${encodeURIComponent(oficio)}`;
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
  return this.http
    .get<{ success: boolean; siguiente: string }>(
      `${TLALCALLI_BASE}expedientes/siguiente`,
      { withCredentials: true }
    )
    .pipe(
      map((response) => {
        if (!response.success || !response.siguiente) {
          throw new Error('El servicio no devolvió un expediente válido');
        }

        return response.siguiente;
      }),
      catchError((error) => {
        this.logger.error('Error al obtener siguiente expediente:', error);
        return of('');
      })
    );
}

  /**
   * Obtiene expedientes recientes para autocompletar
   * @param termino - Término de búsqueda (ej: "EXP-00")
   */
  // !FUNCIÓN DE CARLOS 
  // buscarExpedientes(termino: string): Observable<string[]> {
  //   // TODO: Conectar con el backend cuando esté listo
  //   // return this.http.get<string[]>(`/api/expedientes/buscar?q=${termino}`);
    
  //   // Por ahora retornamos valores mock
  //   const expedientesMock = this.getExpedientesRecientesLocal();
  //   const filtrados = expedientesMock.filter(exp => 
  //     exp.toLowerCase().includes(termino.toLowerCase())
  //   );
  //   return of(filtrados.slice(0, 5)); // Máximo 5 resultados
  // }

  buscarExpedientes(): void {
      try {
        // const validRfcCorto = this.validateRfcCorto(rfc_corto);

        // if (validRfcCorto) {
          this.apiservice
            .getData<any>(`/expedientes/responsable/mis-expedientes`)
            .subscribe({
              next: (data: any) => {
                console.log("DATA: ", data)
              },
              error: (err) => {
                console.error('Error al obtener usuario:', err);
              },
            });
        // }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error desconocido';
        // this.openDialogRFCErroneo('Usuario no encontrado', errorMessage);
      }
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
   * Formatea un número al formato vigente de expediente: EXP-AAMM-0001
   * - AAMM: año (2 dígitos) + mes (2 dígitos) del registro
   * - 0001: consecutivo de 4 dígitos
   */
  private formatearExpediente(numero: number): string {
    const ahora = new Date();
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0'); // Mes: 01-12
    const año = ahora.getFullYear() % 100; // Año a 2 dígitos: 25, 26, etc.
    const añoStr = año.toString().padStart(2, '0');
    const aaMm = `${añoStr}${mes}`;
    return `EXP-${aaMm}-${numero.toString().padStart(4, '0')}`;
  }

  /**
   * Extrae el número consecutivo de un expediente:
   * - Formato vigente: "EXP-2601-0001" -> 1
   * - Formatos antiguos: "EXP-001-12-25" -> 1, "EXP-0001-2025" -> 1, "Exp.001-2025" -> 1
   */
  private extraerNumero(expediente: string): number | null {
    // Formato vigente: EXP-AAMM-0001
    const matchVigente = expediente.match(/EXP-\d{4}-(\d{1,4})/i);
    if (matchVigente) {
      return parseInt(matchVigente[1], 10);
    }
    // Formato nuevo anterior: EXP-001-MM-YY
    const matchNuevoAnterior = expediente.match(/EXP-(\d+)-(\d{2})-(\d{2})/i);
    if (matchNuevoAnterior) {
      return parseInt(matchNuevoAnterior[1], 10);
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
   * Formato vigente: EXP-AAMM-0001 (donde AA es año a 2 dígitos y MM es mes)
   * También acepta formatos antiguos para compatibilidad:
   * - EXP-001-MM-YY
   * - EXP-0001-YYYY
   * - Exp.001-YYYY / Exp.001
   */
  validarFormato(expediente: string): boolean {
    const ahora = new Date();
    const mesActual = (ahora.getMonth() + 1).toString().padStart(2, '0');
    const añoActual = (ahora.getFullYear() % 100).toString().padStart(2, '0');
    const aaMmActual = `${añoActual}${mesActual}`;
    
    // Formato vigente: EXP-AAMM-0001
    const formatoVigente = new RegExp(`^EXP-${aaMmActual}-\\d{4}$`, 'i');
    // Formato nuevo anterior: EXP-001-MM-YY
    const formatoNuevoAnterior = new RegExp(`^EXP-\\d{3}-${mesActual}-${añoActual}$`, 'i');
    // Formato intermedio: EXP-0001-YYYY (compatibilidad)
    const añoCompleto = ahora.getFullYear();
    const formatoIntermedio = new RegExp(`^EXP-\\d{4}-${añoCompleto}$`, 'i');
    // Formato antiguo: Exp.001-YYYY o Exp.001 (compatibilidad)
    const formatoAntiguo = /^Exp\.\d{3}(-\d{4})?$/i;
    
    return (
      formatoVigente.test(expediente) ||
      formatoNuevoAnterior.test(expediente) ||
      formatoIntermedio.test(expediente) ||
      formatoAntiguo.test(expediente)
    );
  }

  /**
   * Auto-formatea mientras el usuario escribe
   * Ej: Usuario escribe "1" -> retorna "EXP-AAMM-0001"
   */
  autoFormatear(valor: string): string {
    // Remover cualquier texto que no sea número
    const soloNumeros = valor.replace(/[^\d]/g, '');
    
    if (soloNumeros.length === 0) return '';
    if (soloNumeros.length > 4) return valor; // No modificar si ya tiene más de 4 dígitos (consecutivo)
    
    const ahora = new Date();
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
    const año = (ahora.getFullYear() % 100).toString().padStart(2, '0');
    const aaMm = `${año}${mes}`;
    // Formatear automáticamente al formato vigente: EXP-AAMM-0001
    return `EXP-${aaMm}-${soloNumeros.padStart(4, '0')}`;
  }
}

