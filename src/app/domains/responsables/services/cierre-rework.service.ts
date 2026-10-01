import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

const TLALCALLI_BASE = environment.baseUrl.endsWith('/') ? environment.baseUrl : `${environment.baseUrl}/`;
const BASE_URL = `${TLALCALLI_BASE}seguimiento_asignacion/cierre`;

/** Fechas en formato YYYY-MM-DD. */
export interface RespuestaParcial {
  descripcion: string;
  fecha_notificacion?: string | null;
}

export interface CierreRework {
  id_expediente: number;
  respuestas_parciales: RespuestaParcial[];
  respuesta_total: string;
  fecha_notif_total_fisica?: string | null;
  fecha_notif_total_correo?: string | null;
  /** id de catalogo_acuse (getCat/4). */
  acuse?: number | null;
  /** id de catalogo_expediente (getCat/5). */
  expediente?: number | null;
  observaciones: string;
  fecha_actualizacion?: string | null;
  usuario_actualizacion?: string | null;
}

export type EstadoCierre = 'SIN_REGISTRO' | 'PARCIAL' | 'TOTAL' | 'COMPLETO';

export interface ResumenCierre {
  id_expediente: number;
  respuestas_parciales: number;
  ultima_notificacion_parcial?: string | null;
  respuesta_total: boolean;
  fecha_notif_total_fisica?: string | null;
  fecha_notif_total_correo?: string | null;
  acuse?: string | null;
  estado_expediente?: string | null;
  estado_cierre: EstadoCierre;
}

@Injectable({ providedIn: 'root' })
export class CierreReworkService {
  constructor(private http: HttpClient) {}

  obtenerCierre(idExpediente: number): Observable<CierreRework | null> {
    return this.http
      .get<{ data: CierreRework | null }>(`${BASE_URL}/${idExpediente}`, { withCredentials: true })
      .pipe(map((r) => r.data));
  }

  guardarCierre(datos: CierreRework): Observable<{ id_expediente: number; mensaje: string }> {
    return this.http.put<{ id_expediente: number; mensaje: string }>(BASE_URL, datos, { withCredentials: true });
  }

  obtenerResumen(): Observable<ResumenCierre[]> {
    return this.http.get<{ data: ResumenCierre[] }>(`${BASE_URL}/resumen`, { withCredentials: true }).pipe(
      map((r) => r.data ?? []),
      catchError(() => of([]))
    );
  }
}
