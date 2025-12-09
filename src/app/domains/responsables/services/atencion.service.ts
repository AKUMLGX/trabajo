import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

// Construir la URL base para Tlapohualli
let baseUrl = environment.baseUrl.endsWith('/') ? environment.baseUrl.slice(0, -1) : environment.baseUrl;
baseUrl = baseUrl.replace(/\/api\/v1\/?$/, '');
const baseWithoutApi = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
const TLAPOHUALLI_BASE = `${baseWithoutApi}tlapohualli/api/v1/`;

// =====================================================
// INTERFACES
// =====================================================

/**
 * Tipos de acción de atención
 */
export type TipoAccion = 'RECHAZADO' | 'PENDIENTE_INFO' | 'ATENCION_INMEDIATA' | 'ADQUISICION_INFO';

/**
 * Medios de rechazo
 */
export type MedioRechazo = 'OFICIO' | 'ATENTA_NOTA' | 'CORREO';

/**
 * Tipos de resultado
 */
export type TipoResultado = 'ACTA_HECHOS' | 'CADENA_CUSTODIA' | 'MEMORIA_TECNICA' | 'NO_APLICA';

/**
 * Especialista del catálogo
 */
export interface CatEspecialista {
  id_especialista: number;
  codigo: string;
  nombre_completo: string;
  tipo: 'EXTERNO' | 'INTERNO';
  activo: boolean;
  fecha_creacion?: string;
}

/**
 * Tipo de insumo del catálogo
 */
export interface CatTipoInsumo {
  id_insumo: number;
  codigo: string;
  descripcion: string;
  activo: boolean;
}

/**
 * Tipo de resultado del catálogo
 */
export interface CatTipoResultado {
  id_resultado: number;
  codigo: string;
  descripcion: string;
  activo: boolean;
}

/**
 * Catálogos de atención completos
 */
export interface CatalogosAtencion {
  especialistas: CatEspecialista[];
  tipos_insumo: CatTipoInsumo[];
  tipos_resultado: CatTipoResultado[];
}

/**
 * DTO para especialista en el formulario
 */
export interface EspecialistaDTO {
  codigo: string;
  nombre: string;
}

/**
 * DTO para crear una atención
 */
export interface CrearAtencionDTO {
  id_expediente: number;
  tipo_accion: TipoAccion;
  
  // Para RECHAZADO
  medio_rechazo?: MedioRechazo;
  
  // Para ATENCION_INMEDIATA
  abogado_asignado?: string;
  
  // Para ADQUISICION_INFO
  tipos_insumo?: string[];
  tipo_resultado?: TipoResultado;
  especialistas?: EspecialistaDTO[];
  
  // Común
  notas?: string;
}

/**
 * Registro de atención guardado
 */
export interface AtencionExpediente {
  id_atencion: number;
  id_expediente: number;
  tipo_accion: TipoAccion;
  medio_rechazo?: string;
  abogado_asignado?: string;
  tipos_insumo?: string; // JSON string
  tipo_resultado?: string;
  notas?: string;
  fecha_registro?: string;
  fecha_actualizacion?: string;
  usuario_registro?: string;
  estado_atencion?: string;
  activo?: boolean;
}

/**
 * Especialista asignado a una atención
 */
export interface EspecialistaAtencion {
  id: number;
  id_atencion: number;
  codigo_especialista: string;
  nombre_especialista: string;
  fecha_asignacion?: string;
  activo?: boolean;
}

/**
 * Atención con especialistas incluidos
 */
export interface AtencionConEspecialistas {
  atencion: AtencionExpediente;
  especialistas: EspecialistaAtencion[];
}

/**
 * Respuesta del API para catálogos
 */
export interface CatalogosResponse {
  success: boolean;
  data: CatalogosAtencion;
}

/**
 * Respuesta del API para crear atención
 */
export interface CrearAtencionResponse {
  success: boolean;
  message: string;
  data: AtencionConEspecialistas;
}

/**
 * Respuesta del API para obtener atenciones
 */
export interface AtencionesResponse {
  success: boolean;
  data: AtencionConEspecialistas[];
  total: number;
}

// =====================================================
// SERVICIO
// =====================================================

@Injectable({
  providedIn: 'root'
})
export class AtencionService {
  private readonly BASE_URL = `${TLAPOHUALLI_BASE}atencion`;

  constructor(private http: HttpClient) {
    console.log('🔧 [AtencionService] URL base:', this.BASE_URL);
  }

  /**
   * Obtener catálogos de atención (especialistas, tipos de insumo, tipos de resultado)
   */
  obtenerCatalogos(): Observable<CatalogosAtencion> {
    const url = `${this.BASE_URL}/catalogos`;
    console.log('📋 [AtencionService] Obteniendo catálogos desde:', url);

    return this.http.get<CatalogosResponse>(url, { withCredentials: true }).pipe(
      map(response => {
        console.log('✅ [AtencionService] Catálogos recibidos:', response);
        return response.data;
      }),
      catchError(error => {
        console.error('❌ [AtencionService] Error al obtener catálogos:', error);
        return of({
          especialistas: [],
          tipos_insumo: [],
          tipos_resultado: []
        });
      })
    );
  }

  /**
   * Crear una nueva atención
   */
  crearAtencion(datos: CrearAtencionDTO): Observable<CrearAtencionResponse> {
    console.log('📝 [AtencionService] Creando atención:', datos);

    return this.http.post<CrearAtencionResponse>(this.BASE_URL, datos, { withCredentials: true }).pipe(
      map(response => {
        console.log('✅ [AtencionService] Atención creada:', response);
        return response;
      }),
      catchError(error => {
        console.error('❌ [AtencionService] Error al crear atención:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener atenciones de un expediente
   */
  obtenerAtencionesExpediente(idExpediente: number): Observable<AtencionConEspecialistas[]> {
    const url = `${this.BASE_URL}/expediente/${idExpediente}`;
    console.log('📋 [AtencionService] Obteniendo atenciones del expediente:', idExpediente);

    return this.http.get<AtencionesResponse>(url, { withCredentials: true }).pipe(
      map(response => {
        console.log('✅ [AtencionService] Atenciones recibidas:', response);
        return response.data;
      }),
      catchError(error => {
        console.error('❌ [AtencionService] Error al obtener atenciones:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtener una atención específica
   */
  obtenerAtencion(idAtencion: number): Observable<AtencionConEspecialistas | null> {
    const url = `${this.BASE_URL}/${idAtencion}`;
    console.log('📋 [AtencionService] Obteniendo atención:', idAtencion);

    return this.http.get<{ success: boolean; data: AtencionConEspecialistas }>(url, { withCredentials: true }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('❌ [AtencionService] Error al obtener atención:', error);
        return of(null);
      })
    );
  }

  /**
   * Eliminar una atención (soft delete)
   */
  eliminarAtencion(idAtencion: number): Observable<boolean> {
    const url = `${this.BASE_URL}/${idAtencion}`;
    console.log('🗑️ [AtencionService] Eliminando atención:', idAtencion);

    return this.http.delete<{ success: boolean }>(url, { withCredentials: true }).pipe(
      map(response => {
        console.log('✅ [AtencionService] Atención eliminada:', response);
        return response.success;
      }),
      catchError(error => {
        console.error('❌ [AtencionService] Error al eliminar atención:', error);
        return of(false);
      })
    );
  }
}

