import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

// Construir la URL base para Tlapohualli
let baseUrl = environment.baseUrl.endsWith('/') ? environment.baseUrl.slice(0, -1) : environment.baseUrl;
baseUrl = baseUrl.replace(/\/api\/v1\/?$/, '');
const baseWithoutApi = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
const DASHBOARD_API = `${baseWithoutApi}tlapohualli/api/v1/dashboard`;

// =====================================================
// INTERFACES
// =====================================================

export interface EstadisticasGenerales {
  total_expedientes: number;
  asignados: number;
  pendientes: number;
  en_atencion: number;
  rechazados: number;
  atendidos_total: number;
  vencidos: number;
  responsables_activos: number;
  promedio_horas_atencion: number;
}

export interface EstadisticasPorEstatus {
  estatus: string;
  cantidad: number;
  porcentaje: number;
}

export interface EstadisticasPorResponsable {
  responsable: string;
  total: number;
  pendientes: number;
  atendidos: number;
}

export interface EstadisticasPorTipoAccion {
  tipo_accion: string;
  cantidad: number;
  urgentes: number;
  altas: number;
}

export interface TendenciaSemanal {
  semana: string;
  creados: number;
  atendidos: number;
}

export interface ExpedienteCritico {
  id_expediente: number;
  expediente: string;
  oficio: string | null;
  responsable: string;
  estatus: string;
  horas_transcurridas: number;
}

export interface SemaforoPrioridades {
  en_tiempo: number;
  atencion: number;
  urgente: number;
  vencido: number;
}

export interface DashboardCompleto {
  generales: EstadisticasGenerales;
  por_estatus: EstadisticasPorEstatus[];
  por_responsable: EstadisticasPorResponsable[];
  por_tipo_accion: EstadisticasPorTipoAccion[];
  tendencia_semanal: TendenciaSemanal[];
  expedientes_criticos: ExpedienteCritico[];
  semaforo: SemaforoPrioridades;
}

interface DashboardResponse {
  success: boolean;
  data: DashboardCompleto;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las estadísticas del dashboard
   */
  obtenerEstadisticas(): Observable<DashboardCompleto> {
    return this.http.get<DashboardResponse>(`${DASHBOARD_API}/estadisticas`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error('Error obteniendo estadísticas');
      }),
      catchError(error => {
        console.error('Error en dashboard:', error);
        // Retornar datos vacíos en caso de error
        return of(this.getDatosFallback());
      })
    );
  }

  /**
   * Datos de fallback para cuando el API no está disponible
   */
  private getDatosFallback(): DashboardCompleto {
    return {
      generales: {
        total_expedientes: 0,
        asignados: 0,
        pendientes: 0,
        en_atencion: 0,
        rechazados: 0,
        atendidos_total: 0,
        vencidos: 0,
        responsables_activos: 0,
        promedio_horas_atencion: 0
      },
      por_estatus: [],
      por_responsable: [],
      por_tipo_accion: [],
      tendencia_semanal: [],
      expedientes_criticos: [],
      semaforo: {
        en_tiempo: 0,
        atencion: 0,
        urgente: 0,
        vencido: 0
      }
    };
  }

  /**
   * Formatear horas a texto legible
   */
  formatearHoras(horas: number): string {
    if (horas < 24) {
      return `${Math.round(horas)}h`;
    } else if (horas < 168) {
      return `${Math.round(horas / 24)}d`;
    } else {
      return `${Math.round(horas / 168)}sem`;
    }
  }

  /**
   * Obtener label del tipo de acción
   */
  getLabelTipoAccion(tipo: string): string {
    const labels: { [key: string]: string } = {
      'RECHAZADO': 'Rechazado',
      'PENDIENTE_INFO': 'Pendiente Info',
      'ATENCION_INMEDIATA': 'Atención Inmediata',
      'ADQUISICION_INFO': 'Adquisición Info',
      'INVESTIGACION_FORENSE': 'Investigación Forense',
      'ELABORACION_DICTAMENES': 'Elaboración Dictámenes',
      'RECUPERACION_INFO': 'Recuperación Info',
      'DESTRUCCION_DISPOSITIVOS': 'Destrucción Dispositivos'
    };
    return labels[tipo] || tipo;
  }

  /**
   * Obtener label del estatus
   */
  getLabelEstatus(estatus: string): string {
    const labels: { [key: string]: string } = {
      'ASIGNADO': 'Asignado',
      'PENDIENTE': 'Pendiente',
      'EN_ATENCION': 'En Atención',
      'RECHAZADO': 'Rechazado',
      'ATENCION_PARCIAL': 'Atención Parcial',
      'ATENCION_TOTAL': 'Atención Total',
      'REVISION_LEGAL': 'Revisión Legal'
    };
    return labels[estatus] || estatus;
  }
}

