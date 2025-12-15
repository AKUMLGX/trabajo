import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { LoggerService } from './logger.service';
import { ExpedienteTlapohualli } from '../interfaces/expediente-tlapohualli.interface';

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

/**
 * Interfaz del formulario completo que se envía al backend
 */
export interface FormularioExpedienteCompleto {
  // Paso 1: Identificación (8 campos)
  oficio: string;
  expediente: string;
  numero_entrada_central: string;
  remitente_area: string;
  fecha_documento: string;
  fecha_recibido: string;
  referencia_asunto: string;
  plazo_vencimiento_prioridad: {
    valor: number;
    unidad: string; // 'dias', 'horas', 'ambos'
    es_urgente: boolean;
  };
  
  // Paso 2: Seguimiento (10 campos - sin los calculados)
  responsable: string;
  fecha_asignacion: string;
  sistema_aplicativo?: string;
  woos?: string;
  estatus: string;
  ubicacion?: string;
  oficios_comision?: string;
  tipo_respuesta?: string;
  
  // Paso 3: Documentos
  documento_pdf_nombre?: string;
  campos_documentos_pospuestos?: string[];
}

/**
 * Servicio para gestionar expedientes de Tlapohualli
 */
@Injectable({
  providedIn: 'root'
})
export class ExpedienteTlapohualliService {
  private readonly BASE_URL = `${TLAPOHUALLI_BASE}expedientes`;
  
  // EventEmitter para notificar cuando se consultan expedientes (para la tabla)
  public expedientesConsultados = new EventEmitter<ExpedienteTlapohualli[]>();

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {
    this.logger.debug('ExpedienteTlapohualliService inicializado - BASE_URL:', this.BASE_URL);
  }

  /**
   * Crear un nuevo expediente desde los 3 pasos del formulario
   */
  /**
   * Consultar expedientes con filtros múltiples (para bandeja de seguimiento)
   */
  consultarExpedientes(filtros: any): Observable<ExpedienteTlapohualli[]> {
    const url = `${TLAPOHUALLI_BASE}expedientes/consulta`;
    const params: any = {};
    
    // Agregar solo los filtros que tienen valor - Campos principales de captura
    if (filtros.oficio) params.oficio = filtros.oficio;
    if (filtros.expediente) params.expediente = filtros.expediente;
    if (filtros.tipo_medio_recepcion) params.tipo_medio_recepcion = filtros.tipo_medio_recepcion;
    if (filtros.remitente_area) params.remitente_area = filtros.remitente_area;
    if (filtros.numero_entrada_central) params.numero_entrada_central = filtros.numero_entrada_central;
    if (filtros.responsable) params.responsable = filtros.responsable;
    if (filtros.prioridad) params.prioridad = filtros.prioridad;
    // Fecha de registro (fecha_creacion)
    if (filtros.fecha_creacion_desde) params.fecha_creacion_desde = filtros.fecha_creacion_desde;
    if (filtros.fecha_creacion_hasta) params.fecha_creacion_hasta = filtros.fecha_creacion_hasta;
    
    return this.http.get<ExpedienteTlapohualli[]>(url, { params, withCredentials: true }).pipe(
      map(expedientes => {
        console.log('📥 [ExpedienteService] Expedientes recibidos del backend:', expedientes);
        // Debug: Verificar documento_pdf_nombre en cada expediente
        expedientes.forEach((exp, index) => {
          console.log(`📄 [ExpedienteService] Expediente ${index + 1}:`, {
            id: exp.id_expediente,
            expediente: exp.expediente,
            oficio: exp.oficio,
            documento_pdf_nombre: exp.documento_pdf_nombre,
            tipo: typeof exp.documento_pdf_nombre,
            tienePdf: !!(exp.documento_pdf_nombre && exp.documento_pdf_nombre.trim && exp.documento_pdf_nombre.trim() !== '')
          });
        });
        return expedientes;
      }),
      catchError(error => {
        this.logger.error('Error al consultar expedientes:', error);
        return of([]);
      })
    );
  }

  /**
   * Autocompletado para un campo específico (para bandeja de seguimiento)
   */
  autocompletadoCampo(valor: string, campo: string): Observable<string[]> {
    const url = `${TLAPOHUALLI_BASE}expedientes/autocompletado`;
    const params: any = { [campo]: valor };
    
    return this.http.get<string[]>(url, { params, withCredentials: true }).pipe(
      catchError(error => {
        this.logger.error('Error al obtener autocompletado:', error);
        return of([]);
      })
    );
  }

  crearExpedienteDesdePasos(
    paso1: any,
    paso2: any,
    paso3: any
  ): Observable<any> {
    // Construir el formulario completo con valores por defecto para campos eliminados
    // pero que el backend aún requiere
    const formularioCompleto: any = {
      // Paso 1: Identificación
      tipo_medio_recepcion: paso1.tipo_medio_recepcion,
      oficio: paso1.oficio,
      expediente: paso1.expediente,
      numero_entrada_central: paso1.numero_entrada_central || '',
      remitente_area: paso1.remitente_area,
      fecha_documento: paso1.fecha_documento,
      fecha_recibido: paso1.fecha_recibido,
      fecha_requerimiento: paso1.fecha_requerimiento || paso1.fecha_documento, // Nuevo campo, fallback a fecha_documento si no existe
      referencia_asunto: paso1.referencia_asunto,
      plazo_vencimiento_prioridad: paso1.plazo_vencimiento_prioridad,
      
      // Paso 2: Seguimiento
      responsable: paso2.responsable,
      fecha_asignacion: paso2.fecha_asignacion,
      sistema_aplicativo: paso2.sistema_aplicativo || null,
      estatus: paso2.estatus,
      // ubicacion debe ser: 'CARPETA_GENERAL' o 'CARPETA_INDIVIDUAL'
      // Mapear valores del formulario (CARPETA_GENERAL_I, II, etc.) a valores válidos de BD
      ubicacion: this.mapearUbicacion(paso2.ubicacion),
      
      // Campos eliminados del formulario pero requeridos por el backend
      // Se envían con valores por defecto que cumplen las restricciones CHECK de la BD
      woos: paso2.woos || 'N/A', // Campo eliminado, valor por defecto
      // tipo_respuesta debe ser: 'TOTAL', 'PARCIAL', 'PENDIENTE'
      tipo_respuesta: paso2.tipo_respuesta || 'PENDIENTE', // Campo eliminado, valor por defecto válido
      oficios_comision: paso2.oficios_comision || null, // Campo eliminado, opcional
      fecha_notificacion: paso2.fecha_notificacion || null, // Campo eliminado, opcional
      
      // Paso 3: Documentos
      // Campos eliminados del formulario pero requeridos por el backend
      // tipo_documento debe ser: 'DICTAMEN', 'REPORTE', 'ACTA_HECHOS', 'MEMORIA_TECNICA', 'SIN_INFO'
      tipo_documento: paso3.tipo_documento || 'SIN_INFO', // Campo eliminado, valor por defecto válido
      anexos: paso3.anexos || null, // Campo eliminado, opcional
      acuse_fisico_digital: paso3.acuse_fisico_digital || null, // Campo eliminado, opcional
      // expediente_fisico_digital debe ser: 'FISICO', 'DIGITAL', 'AMBOS', 'NINGUNO'
      expediente_fisico_digital: paso3.expediente_fisico_digital || 'DIGITAL', // Campo eliminado, valor por defecto válido
      comentarios_omega: paso3.comentarios_omega || null, // Campo eliminado, opcional
      
      // Campos que sí se usan
      documento_pdf_nombre: paso3.documento_pdf ? paso3.documento_pdf.name : undefined,
      campos_documentos_pospuestos: paso3.campos_pospuestos || [],
      
      // Prioridad del expediente (asignada en captura - movida al Step 1)
      prioridad: paso1.prioridad || 'MEDIA'
    };

    const formData = new FormData();
    formData.append('payload', new Blob([JSON.stringify(formularioCompleto)], { type: 'application/json' }));

    if (paso3.documento_pdf) {
      formData.append('documento_pdf', paso3.documento_pdf, paso3.documento_pdf.name);
    }

    return this.http.post<any>(this.BASE_URL, formData, { withCredentials: true }).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Error al crear expediente');
      })
    );
  }

  /**
   * Mapear valores de ubicación del formulario a valores válidos de la BD
   * El formulario usa: CARPETA_GENERAL_I, CARPETA_GENERAL_II, etc.
   * La BD solo acepta: CARPETA_GENERAL o CARPETA_INDIVIDUAL
   */
  private mapearUbicacion(ubicacion: string | undefined | null): string {
    if (!ubicacion) {
      return 'CARPETA_GENERAL'; // Valor por defecto
    }
    
    // Si comienza con CARPETA_GENERAL, mapear a CARPETA_GENERAL
    if (ubicacion.startsWith('CARPETA_GENERAL')) {
      return 'CARPETA_GENERAL';
    }
    
    // Si es CARPETA_INDIVIDUAL, mantenerlo
    if (ubicacion === 'CARPETA_INDIVIDUAL') {
      return 'CARPETA_INDIVIDUAL';
    }
    
    // Valor por defecto si no coincide
    return 'CARPETA_GENERAL';
  }

  /**
   * Obtener todos los expedientes
   */
  obtenerExpedientes(): Observable<any[]> {
    return this.http.get<any>(this.BASE_URL).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener expedientes');
      })
    );
  }

  /**
   * Obtener un expediente por ID
   */
  obtenerExpedientePorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/${id}`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener expediente');
      })
    );
  }

  /**
   * Obtener dashboard (expedientes en trámite y pendientes)
   */
  obtenerDashboard(): Observable<any[]> {
    return this.http.get<any>(`${this.BASE_URL}/dashboard`).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener dashboard');
      })
    );
  }

  /**
   * Actualizar un expediente
   */
  actualizarExpediente(id: number, datos: Partial<FormularioExpedienteCompleto>): Observable<any> {
    return this.http.put<any>(`${this.BASE_URL}/${id}`, datos).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'Error al actualizar expediente');
      })
    );
  }

  /**
   * Eliminar un expediente
   */
  eliminarExpediente(id: number): Observable<void> {
    return this.http.delete<any>(`${this.BASE_URL}/${id}`).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Error al eliminar expediente');
        }
      })
    );
  }

  /**
   * Validar si un oficio ya existe en la BD
   * Retorna información sobre TODOS los expedientes encontrados con ese oficio
   */
  validarOficioExistente(oficio: string): Observable<{
    success: boolean;
    existe: boolean;
    total: number;
    mensaje: string;
    oficio_buscado?: string;
    ids_expedientes?: number[];
    expedientes?: Array<{
      id_expediente: number;
      expediente: string;
      fecha_creacion: string;
      estatus: string;
      remitente_area: string;
      referencia_asunto: string;
    }>;
  }> {
    return this.http.get<any>(`${this.BASE_URL}/validar-oficio/${encodeURIComponent(oficio)}`, { withCredentials: true });
  }

  /**
   * Buscar TODOS los expedientes por oficio
   * Permite múltiples expedientes con el mismo oficio
   */
  buscarExpedientesPorOficio(oficio: string): Observable<{
    success: boolean;
    data: any[];
    total: number;
    message: string;
  }> {
    const oficioEncoded = encodeURIComponent(oficio);
    const url = `${this.BASE_URL}/oficio/${oficioEncoded}`;
    
    this.logger.debug('Buscando expedientes por oficio:', oficio);
    
    return this.http.get<any>(url, { withCredentials: true }).pipe(
      map(response => {
        this.logger.debug('Respuesta del servidor - Total expedientes:', response?.total);
        
        if (response && response.success) {
          const resultado = {
            success: true,
            data: response.data || [],
            total: response.total || 0,
            message: response.message || ''
          };
          return resultado;
        }
        
        this.logger.warn('Respuesta no exitosa del servidor');
        throw new Error(response?.message || 'Error al buscar expedientes');
      }),
      catchError(error => {
        this.logger.error('Error al buscar expedientes por oficio:', {
          status: error?.status,
          message: error?.message,
          url: error?.url
        });
        
        // Re-lanzar el error para que el componente lo maneje
        throw error;
      })
    );
  }

  /**
   * Descargar expedientes en formato Excel con los filtros aplicados
   */
  descargarExcelExpedientes(filtros: any): Observable<Blob> {
    const url = `${TLAPOHUALLI_BASE}expedientes/descargar-excel`;
    let params = new HttpParams();
    
    // Agregar solo los filtros que tienen valor
    if (filtros.oficio) params = params.set('oficio', filtros.oficio);
    if (filtros.expediente) params = params.set('expediente', filtros.expediente);
    if (filtros.tipo_medio_recepcion) params = params.set('tipo_medio_recepcion', filtros.tipo_medio_recepcion);
    if (filtros.remitente_area) params = params.set('remitente_area', filtros.remitente_area);
    if (filtros.numero_entrada_central) params = params.set('numero_entrada_central', filtros.numero_entrada_central);
    if (filtros.responsable) params = params.set('responsable', filtros.responsable);
    if (filtros.prioridad) params = params.set('prioridad', filtros.prioridad);
    if (filtros.fecha_creacion_desde) params = params.set('fecha_creacion_desde', filtros.fecha_creacion_desde);
    if (filtros.fecha_creacion_hasta) params = params.set('fecha_creacion_hasta', filtros.fecha_creacion_hasta);
    
    return this.http.get(url, { 
      params, 
      responseType: 'blob',
      withCredentials: true 
    }).pipe(
      map(blob => blob),
      catchError(error => {
        this.logger.error('Error al descargar Excel:', error);
        throw error;
      })
    );
  }
}
