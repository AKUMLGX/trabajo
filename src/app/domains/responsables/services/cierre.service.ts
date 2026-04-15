import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

// URL base del backend: environment.baseUrl = http://localhost:8090/tlalcalli/api/v1/
const TLALCALLI_BASE = environment.baseUrl.endsWith('/') ? environment.baseUrl : `${environment.baseUrl}/`;

// =====================================================
// INTERFACES
// =====================================================

export interface CrearCierreDTO {
  id_atencion: number;
  id_expediente: number;
  ticket_numero?: string | null;
  ticket_fecha_apertura?: string | null;
  ticket_fecha_resolucion?: string | null;
  respuesta_estado?: string | null;
  respuesta_tipo?: string | null;
  respuesta_numero?: string | null;
  respuesta_fecha?: string | null;
  notificacion_fecha?: string | null;
  dispositivo_serie?: string | null;
  dispositivo_modelo?: string | null;
  observaciones?: string | null;
}

export interface CierreExpediente {
  id_cierre: number;
  id_atencion: number;
  id_expediente: number;
  ticket_numero?: string | null;
  ticket_fecha_apertura?: string | null;
  ticket_fecha_resolucion?: string | null;
  respuesta_estado?: string | null;
  respuesta_tipo?: string | null;
  respuesta_numero?: string | null;
  respuesta_fecha?: string | null;
  notificacion_fecha?: string | null;
  dispositivo_serie?: string | null;
  dispositivo_modelo?: string | null;
  observaciones?: string | null;
  fecha_creacion?: string | null;
  fecha_actualizacion?: string | null;
  usuario_creacion?: string | null;
  usuario_actualizacion?: string | null;
  activo?: boolean | null;
}

export interface GuardarCierreResponse {
  success: boolean;
  message: string;
  data: CierreExpediente;
}

export interface ObtenerCierreResponse {
  success: boolean;
  data?: CierreExpediente;
  message?: string;
}

export interface ObtenerTodosCierresResponse {
  success: boolean;
  data: CierreExpediente[];
  total: number;
}

// =====================================================
// SERVICIO
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class CierreService {
  private readonly BASE_URL = `${TLALCALLI_BASE}cierre`;

  constructor(private http: HttpClient) {
    console.log('🔧 [CierreService] URL base:', this.BASE_URL);
  }

  /**
   * Guardar o actualizar un cierre
   */
  guardarCierre(datos: CrearCierreDTO): Observable<GuardarCierreResponse> {
    console.log('📝 [CierreService] Guardando cierre:', datos);

    return this.http.post<GuardarCierreResponse>(this.BASE_URL, datos, { withCredentials: true }).pipe(
      map(response => {
        console.log('✅ [CierreService] Cierre guardado:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ [CierreService] Error al guardar cierre:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener cierre por id_atencion
   */
  obtenerCierrePorAtencion(idAtencion: number): Observable<ObtenerCierreResponse> {
    const url = `${this.BASE_URL}/atencion/${idAtencion}`;
    console.log('📋 [CierreService] Obteniendo cierre para atención:', idAtencion);

    return this.http.get<ObtenerCierreResponse>(url, { withCredentials: true }).pipe(
      map(response => {
        console.log('✅ [CierreService] Cierre recibido:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ [CierreService] Error al obtener cierre:', error);
        // Si no existe, retornar respuesta con success: false
        return of({ success: false, message: 'Cierre no encontrado' });
      })
    );
  }

  /**
   * Obtener todos los cierres
   */
  obtenerTodosCierres(): Observable<CierreExpediente[]> {
    const url = `${this.BASE_URL}/todos`;
    console.log('📋 [CierreService] Obteniendo todos los cierres');

    return this.http.get<ObtenerTodosCierresResponse>(url, { withCredentials: true }).pipe(
      map(response => {
        console.log('✅ [CierreService] Cierres recibidos:', response);
        return response.data;
      }),
      catchError(error => {
        console.error('❌ [CierreService] Error al obtener cierres:', error);
        return of([]);
      })
    );
  }
}

