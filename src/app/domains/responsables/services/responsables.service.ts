import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ExpedienteTlalcalli } from '../../capture/interfaces/expediente-tlalcalli.interface';

// Construir la URL base para Tlalcalli
let baseUrl = environment.baseUrl.endsWith('/') ? environment.baseUrl.slice(0, -1) : environment.baseUrl;
baseUrl = baseUrl.replace(/\/api\/v1\/?$/, '');
const baseWithoutApi = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
const TLALCALLI_BASE = `${baseWithoutApi}tlalcalli/api/v1/`;

/**
 * Interfaz para la respuesta de mis expedientes
 */
export interface MisExpedientesResponse {
  success: boolean;
  data: ExpedienteTlalcalli[];
  total: number;
  estadisticas: {
    total: number;
    con_retraso: number;
    urgentes: number;
    por_estatus: { [key: string]: number };
  };
  responsable: string;
}

/**
 * Interfaz para el dashboard del responsable
 */
export interface DashboardResponsableResponse {
  success: boolean;
  responsable: string;
  estadisticas: {
    total: number;
    asignados: number;
    pendientes: number;
    atencion_parcial: number;
    atencion_total: number;
    revision_legal: number;
    con_retraso: number;
    urgentes: number;
    proximos_vencer: number;
  };
  mas_antiguos: Array<{
    id_expediente: number;
    expediente: string;
    oficio: string | null;
    fecha_asignacion: string;
    estatus: string;
    dias_retraso: number | null;
  }>;
}

/**
 * Interfaz para filtros de búsqueda
 */
export interface FiltrosResponsable {
  estatus?: string;
  oficio?: string;
  expediente?: string;
  remitente_area?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

/**
 * Servicio para gestionar la bandeja de responsables
 */
@Injectable({
  providedIn: 'root'
})
export class ResponsablesService {
  private readonly BASE_URL = `${TLALCALLI_BASE}expedientes/responsable`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener los expedientes asignados al responsable autenticado
   * El backend filtra automáticamente por el nombre del responsable del JWT
   */
  obtenerMisExpedientes(filtros?: FiltrosResponsable): Observable<MisExpedientesResponse> {
    const url = `${this.BASE_URL}/mis-expedientes`;
    const params: any = {};

    // Agregar filtros opcionales
    if (filtros) {
      if (filtros.estatus) params.estatus = filtros.estatus;
      if (filtros.oficio) params.oficio = filtros.oficio;
      if (filtros.expediente) params.expediente = filtros.expediente;
      if (filtros.remitente_area) params.remitente_area = filtros.remitente_area;
      if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
      if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;
    }

    return this.http.get<MisExpedientesResponse>(url, { params, withCredentials: true }).pipe(
      map(response => {
        console.log('📥 [ResponsablesService] Expedientes recibidos:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ [ResponsablesService] Error al obtener expedientes:', error);
        // Retornar respuesta vacía en caso de error
        return of({
          success: false,
          data: [],
          total: 0,
          estadisticas: {
            total: 0,
            con_retraso: 0,
            urgentes: 0,
            por_estatus: {}
          },
          responsable: ''
        });
      })
    );
  }

  /**
   * Obtener dashboard con estadísticas del responsable
   */
  obtenerDashboard(): Observable<DashboardResponsableResponse> {
    const url = `${this.BASE_URL}/dashboard`;

    return this.http.get<DashboardResponsableResponse>(url, { withCredentials: true }).pipe(
      map(response => {
        console.log('📊 [ResponsablesService] Dashboard recibido:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ [ResponsablesService] Error al obtener dashboard:', error);
        // Retornar dashboard vacío en caso de error
        return of({
          success: false,
          responsable: '',
          estadisticas: {
            total: 0,
            asignados: 0,
            pendientes: 0,
            atencion_parcial: 0,
            atencion_total: 0,
            revision_legal: 0,
            con_retraso: 0,
            urgentes: 0,
            proximos_vencer: 0
          },
          mas_antiguos: []
        });
      })
    );
  }
}

