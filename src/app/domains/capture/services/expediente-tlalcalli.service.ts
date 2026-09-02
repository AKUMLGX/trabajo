import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { LoggerService } from './logger.service';
import { ExpedienteTlalcalli } from '../interfaces/expediente-tlalcalli.interface';
import {
  ExpedienteReworkInicialPayload,
  ExpedienteReworkInicialResponse,
  CatalogoReworkItem,
  CargaPdfReworkResponse,
  ArchivoPdfRework,
} from '../interfaces/expediente-rework.interface';
import {
  ExpedienteDetalleCaptura,
  ExpedienteReworkCompletoResponse,
  ExpedienteReworkConsultaRow,
} from '../../tracking/interfaces/expediente-detalle-captura.interface';
import {
  TipoUsuarioRequerimiento,
  UsuarioRequerimiento,
} from '../../interfaces/usuarios-expediente.interface';

// URL base del backend: environment.baseUrl = https://balam.sat.gob.mx/tlalcalli/api/v1/
const TLALCALLI_BASE = environment.baseUrl.endsWith('/') ? environment.baseUrl : `${environment.baseUrl}/`;

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
 * Servicio para gestionar expedientes de Tlalcalli
 */
@Injectable({
  providedIn: 'root'
})
export class ExpedienteTlalcalliService {
  private readonly BASE_URL = `${TLALCALLI_BASE}expedientes`;
  private readonly REWORK_INICIAL_URL = `${TLALCALLI_BASE}expedientes_rework/inicial`;
  private readonly REWORK_CARGA_PDF_URL = `${TLALCALLI_BASE}expedientes_rework/carga_pdf`;
  private readonly REWORK_ARCHIVOS_PDF_URL = `${TLALCALLI_BASE}expedientes_rework/archivos_pdf`;
  private readonly REWORK_DESCARGA_PDF_URL = `${TLALCALLI_BASE}expedientes_rework/descarga_pdf`;

  // EventEmitter para notificar cuando se consultan expedientes (para la tabla)
  public expedientesConsultados = new EventEmitter<ExpedienteTlalcalli[]>();

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {
    this.logger.debug('ExpedienteTlalcalliService inicializado - BASE_URL:', this.BASE_URL);
  }

  /**
   * Crear un nuevo expediente desde los 3 pasos del formulario
   */
  /**
   * Consultar expedientes con filtros múltiples (para bandeja de seguimiento)
   */
  consultarExpedientes(filtros: Record<string, unknown>): Observable<ExpedienteTlalcalli[]> {
    const params = this.construirParamsConsulta(filtros);
    const urlLegacy = `${TLALCALLI_BASE}expedientes/consulta`;
    const urlRework = `${TLALCALLI_BASE}expedientes_rework/consulta`;

    return forkJoin({
      legacy: this.http
        .get<ExpedienteTlalcalli[]>(urlLegacy, { params, withCredentials: true })
        .pipe(catchError(() => of([] as ExpedienteTlalcalli[]))),
      rework: this.http
        .get<ExpedienteReworkConsultaRow[]>(urlRework, { params, withCredentials: true })
        .pipe(catchError(() => of([] as ExpedienteReworkConsultaRow[]))),
    }).pipe(
      map(({ legacy, rework }) => {
        const reworkMapeados = rework.map((row) => this.mapReworkConsultaToLegacy(row));
        const combinados = [...reworkMapeados, ...(legacy ?? [])];
        console.log('📥 [ExpedienteService] Resultados consulta:', {
          rework: reworkMapeados.length,
          legacy: legacy?.length ?? 0,
          total: combinados.length,
        });
        return combinados;
      }),
      catchError(error => {
        this.logger.error('Error al consultar expedientes:', error);
        return of([]);
      })
    );
  }

  private construirParamsConsulta(filtros: Record<string, unknown>): Record<string, string> {
    const params: Record<string, string> = {};

    const agregar = (clave: string, valor: unknown): void => {
      if (valor === null || valor === undefined || valor === '') {
        return;
      }
      params[clave] = String(valor);
    };

    agregar('oficio', filtros['oficio']);
    agregar('expediente', filtros['expediente']);
    agregar('tipo_medio_recepcion', filtros['tipo_medio_recepcion']);
    agregar('remitente_area', filtros['remitente_area']);
    agregar('numero_entrada_central', filtros['numero_entrada_central']);
    agregar('responsable', filtros['responsable']);
    agregar('prioridad', filtros['prioridad']);
    agregar('estatus', filtros['estatus']);
    agregar('referencia_asunto', filtros['referencia_asunto']);
    agregar('fecha_documento_desde', filtros['fecha_documento_desde']);
    agregar('fecha_documento_hasta', filtros['fecha_documento_hasta']);
    agregar('fecha_recibido_desde', filtros['fecha_recibido_desde']);
    agregar('fecha_recibido_hasta', filtros['fecha_recibido_hasta']);
    agregar('fecha_creacion_desde', filtros['fecha_creacion_desde']);
    agregar('fecha_creacion_hasta', filtros['fecha_creacion_hasta']);

    return params;
  }

  private mapReworkConsultaToLegacy(row: ExpedienteReworkConsultaRow): ExpedienteTlalcalli {
    return {
      id_expediente: row.id,
      expediente: row.num_expediente,
      oficio: row.num_oficio,
      numero_entrada_central: row.num_entrada,
      remitente_area: row.remitente,
      fecha_documento: row.fecha_documento,
      fecha_recibido: row.fecha_recepcion,
      fecha_vencimiento: row.fecha_vencimiento,
      referencia_asunto: row.asunto,
      sistema_aplicativo: row.aplicativos ?? undefined,
      responsable: row.responsable,
      prioridad: String(row.prioridad),
      estatus: String(row.status),
      ubicacion: String(row.ubicacion),
    };
  }

  /**
   * Autocompletado para un campo específico (para bandeja de seguimiento)
   */
  autocompletadoCampo(valor: string, campo: string): Observable<string[]> {
    const url = `${TLALCALLI_BASE}expedientes/autocompletado`;
    const params: any = { [campo]: valor };

    return this.http.get<string[]>(url, { params, withCredentials: true }).pipe(
      catchError(error => {
        this.logger.error('Error al obtener autocompletado:', error);
        return of([]);
      })
    );
  }

  /**
   * Arma la vista de detalle homologada con captura (legacy + rework si aplica).
   */
  obtenerDetalleCaptura(expediente: ExpedienteTlalcalli): Observable<ExpedienteDetalleCaptura> {
    const catalogos$ = forkJoin({
      servicios: this.obtenerCatalogoGetCat(1),
      prioridades: this.obtenerCatalogoGetCat(2),
      estatus: this.obtenerCatalogoGetCat(3),
      ubicaciones: this.obtenerCatalogoGetCat(6),
    });

    const rework$ =
      expediente.id_expediente != null
        ? this.http
            .get<ExpedienteReworkCompletoResponse>(
              `${TLALCALLI_BASE}expedientes_rework/completo/${expediente.id_expediente}`,
              { withCredentials: true }
            )
            .pipe(catchError(() => of(null)))
        : of(null);

    const archivosPdf$ =
      expediente.id_expediente != null
        ? this.listarArchivosPdfRework(expediente.id_expediente)
        : of([] as ArchivoPdfRework[]);

    return forkJoin({ catalogos: catalogos$, rework: rework$, archivosPdf: archivosPdf$ }).pipe(
      map(({ catalogos, rework, archivosPdf }) => {
        if (rework?.expediente) {
          return this.mapReworkToDetalle(expediente, rework, catalogos, archivosPdf);
        }
        return this.mapLegacyToDetalle(expediente, catalogos);
      })
    );
  }

  private obtenerCatalogoGetCat(numero: number): Observable<CatalogoReworkItem[]> {
    return this.http
      .get<CatalogoReworkItem[]>(`${TLALCALLI_BASE}catalogo/getCat/${numero}`, {
        withCredentials: true,
      })
      .pipe(catchError(() => of([])));
  }

  private mapLegacyToDetalle(
    expediente: ExpedienteTlalcalli,
    catalogos: {
      servicios: CatalogoReworkItem[];
      prioridades: CatalogoReworkItem[];
      estatus: CatalogoReworkItem[];
      ubicaciones: CatalogoReworkItem[];
    }
  ): ExpedienteDetalleCaptura {
    return {
      id_expediente: expediente.id_expediente,
      origen: 'legacy',
      expediente: expediente.expediente || 'N/A',
      oficio: expediente.oficio || 'N/A',
      tipo_medio_recepcion: this.formatearTipoMedio(expediente.tipo_medio_recepcion),
      servicio: 'N/A',
      numero_entrada_central: expediente.numero_entrada_central || 'N/A',
      remitente: expediente.remitente_area || 'N/A',
      fecha_documento: this.formatearFechaDetalle(expediente.fecha_documento),
      fecha_recepcion: this.formatearFechaDetalle(expediente.fecha_recibido),
      fecha_vencimiento: this.formatearFechaDetalle(expediente.fecha_vencimiento),
      prioridad: expediente.prioridad || 'N/A',
      asunto: expediente.referencia_asunto || 'N/A',
      usuarios: [],
      aplicativos: expediente.sistema_aplicativo || 'N/A',
      responsable: expediente.responsable || 'N/A',
      estatus: this.formatearEstatusLegacy(expediente.estatus),
      ubicacion: this.formatearUbicacionLegacy(expediente.ubicacion),
      observaciones: expediente.comentarios_omega || 'N/A',
      documento_pdf_nombre: expediente.documento_pdf_nombre ?? null,
      tiene_pdf: !!(expediente.documento_pdf_nombre && expediente.oficio),
    };
  }

  private mapReworkToDetalle(
    expediente: ExpedienteTlalcalli,
    rework: ExpedienteReworkCompletoResponse,
    catalogos: {
      servicios: CatalogoReworkItem[];
      prioridades: CatalogoReworkItem[];
      estatus: CatalogoReworkItem[];
      ubicaciones: CatalogoReworkItem[];
    },
    archivosPdf: ArchivoPdfRework[] = []
  ): ExpedienteDetalleCaptura {
    const data = rework.expediente;
    const archivos = archivosPdf.map((a) => ({
      id_archivo: a.id_archivo,
      nombre_archivo: a.nombre_archivo || this.nombreDesdePath(a.path_archivo),
    }));
    const primerArchivo = archivos[0];

    return {
      id_expediente: data.id,
      origen: 'rework',
      expediente: data.num_expediente || 'N/A',
      oficio: data.num_oficio || 'N/A',
      tipo_medio_recepcion: this.formatearTipoMedio(expediente.tipo_medio_recepcion),
      servicio: this.etiquetaCatalogo(catalogos.servicios, data.servicio),
      numero_entrada_central: data.num_entrada || 'N/A',
      remitente: data.remitente || 'N/A',
      fecha_documento: this.formatearFechaDetalle(data.fecha_documento),
      fecha_recepcion: this.formatearFechaDetalle(data.fecha_recepcion),
      fecha_vencimiento: this.formatearFechaDetalle(data.fecha_vencimiento),
      prioridad: this.etiquetaCatalogo(catalogos.prioridades, data.prioridad),
      asunto: data.asunto || 'N/A',
      usuarios: this.parsearUsuarios(data.usuarios),
      aplicativos: data.aplicativos || 'N/A',
      responsable: data.responsable || 'N/A',
      estatus: this.etiquetaCatalogo(catalogos.estatus, data.status),
      ubicacion: this.etiquetaCatalogo(catalogos.ubicaciones, data.ubicacion),
      observaciones: data.observaciones || 'N/A',
      documento_pdf_nombre: primerArchivo?.nombre_archivo ?? expediente.documento_pdf_nombre ?? null,
      tiene_pdf: archivos.length > 0 || !!(expediente.documento_pdf_nombre && (data.num_oficio || expediente.oficio)),
      id_archivo_pdf: primerArchivo?.id_archivo ?? null,
      archivos_pdf: archivos,
    };
  }

  private etiquetaCatalogo(catalogo: CatalogoReworkItem[], id: number): string {
    const item = catalogo.find((c) => c.id_exp === id);
    if (!item) {
      return 'N/A';
    }

    if (item.descripcion.toLowerCase().startsWith('extra urgente')) {
      return 'Extra urgente';
    }

    return item.descripcion.split('(')[0].trim();
  }

  private parsearUsuarios(cadena: string | null | undefined): UsuarioRequerimiento[] {
    if (!cadena?.trim()) {
      return [];
    }

    return cadena
      .split(';')
      .map((bloque) => bloque.trim())
      .filter(Boolean)
      .map((bloque) => {
        const [nombre = '', rfc = '', tipo = ''] = bloque.split(',').map((p) => p.trim());
        return {
          id_temporal: '',
          nombre,
          rfc,
          tipo_usuario: this.normalizarTipoUsuario(tipo),
        };
      });
  }

  private normalizarTipoUsuario(tipo: string): TipoUsuarioRequerimiento {
    const upper = tipo.toUpperCase();
    if (upper === 'SERVIDOR_PUBLICO' || upper === 'EMPRESA' || upper === 'NA') {
      return upper as TipoUsuarioRequerimiento;
    }
    return 'NA';
  }

  private formatearFechaDetalle(fecha: string | Date | null | undefined): string {
    if (!fecha) {
      return 'N/A';
    }

    if (fecha instanceof Date) {
      return fecha.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }

    const iso = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) {
      return `${iso[3]}/${iso[2]}/${iso[1]}`;
    }

    return fecha;
  }

  private formatearTipoMedio(tipo: string | null | undefined): string {
    if (!tipo) {
      return 'N/A';
    }

    const tipos: Record<string, string> = {
      ATENTA_NOTA: 'Atenta nota',
      OFICIO: 'Oficio',
      REQUERIMIENTO_VERBAL: 'Petición interna',
      CORREO_ELECTRONICO: 'Correo electrónico',
    };

    return tipos[tipo] || tipo;
  }

  private formatearEstatusLegacy(estatus: string | undefined): string {
    if (!estatus) {
      return 'N/A';
    }

    return estatus.replace(/_/g, ' ');
  }

  private formatearUbicacionLegacy(ubicacion: string | undefined): string {
    if (!ubicacion) {
      return 'N/A';
    }

    const mapa: Record<string, string> = {
      CARPETA_GENERAL: 'Carpeta General',
      CARPETA_INDIVIDUAL: 'Individual',
    };

    return mapa[ubicacion] || ubicacion.replace(/_/g, ' ');
  }

  crearExpedienteReworkInicial(paso1: any, paso2: any): Observable<ExpedienteReworkInicialResponse> {
    const payload = this.construirPayloadReworkInicial(paso1, paso2);

    this.logger.debug('POST expedientes_rework/inicial', payload);

    return this.http.post<ExpedienteReworkInicialResponse>(
      this.REWORK_INICIAL_URL,
      payload,
      { withCredentials: true }
    );
  }

  /**
   * Carga PDF asociado a un expediente rework (después de POST inicial).
   * POST multipart: pdf + id_expediente
   */
  cargarPdfRework(idExpediente: number, pdf: File): Observable<CargaPdfReworkResponse> {
    const formData = new FormData();
    formData.append('pdf', pdf, pdf.name);
    formData.append('id_expediente', String(idExpediente));

    this.logger.debug('POST expedientes_rework/carga_pdf', {
      id_expediente: idExpediente,
      archivo: pdf.name,
    });

    return this.http.post<CargaPdfReworkResponse>(this.REWORK_CARGA_PDF_URL, formData, {
      withCredentials: true,
    });
  }

  /**
   * Lista PDFs del expediente rework. Requiere GET archivos_pdf/{id} en back (pendiente Max).
   */
  listarArchivosPdfRework(idExpediente: number): Observable<ArchivoPdfRework[]> {
    return this.http
      .get<ArchivoPdfRework[]>(`${this.REWORK_ARCHIVOS_PDF_URL}/${idExpediente}`, {
        withCredentials: true,
      })
      .pipe(
        map((archivos) =>
          (archivos ?? []).map((archivo) => ({
            ...archivo,
            nombre_archivo: archivo.nombre_archivo || this.nombreDesdePath(archivo.path_archivo),
          }))
        ),
        catchError(() => of([]))
      );
  }

  /**
   * Descarga PDF por id_archivo. Requiere GET descarga_pdf/{id} en back (pendiente Max).
   */
  descargarPdfReworkArchivo(idArchivo: number): Observable<Blob> {
    return this.http.get(`${this.REWORK_DESCARGA_PDF_URL}/${idArchivo}`, {
      withCredentials: true,
      responseType: 'blob',
    });
  }

  private nombreDesdePath(path: string): string {
    if (!path) {
      return 'documento.pdf';
    }
    const partes = path.replace(/\\/g, '/').split('/');
    return partes[partes.length - 1] || 'documento.pdf';
  }

  private construirPayloadReworkInicial(paso1: any, paso2: any): ExpedienteReworkInicialPayload {
    const usuarios = Array.isArray(paso1.usuarios) ? paso1.usuarios : [];

    return {
      num_expediente: paso1.expediente || '',
      num_oficio: paso1.oficio || '',
      servicio: Number(paso1.servicio ?? 0),
      num_entrada: paso1.numero_entrada_central || '',
      remitente: paso1.remitente_area || paso1.remitente_identificador || '',
      fecha_documento: this.formatearFechaRework(paso1.fecha_documento),
      fecha_recepcion: this.formatearFechaRework(paso1.fecha_recibido),
      prioridad: Number(paso1.prioridad ?? 1),
      fecha_vencimiento: this.formatearFechaRework(paso1.fecha_vencimiento),
      asunto: paso1.referencia_asunto || '',
      usuarios: this.serializarUsuarios(usuarios),
      aplicativos: paso2.sistema_aplicativo || '',
      responsable: this.comoTexto(paso2.responsable),
      status: Number(paso2.status ?? paso2.estatus ?? 0),
      observaciones: paso2.observaciones_estatus || '',
      ubicacion: Number(paso2.ubicacion ?? 1)
    };
  }

  private formatearFechaRework(fecha: Date | string | undefined | null): string {
    if (!fecha) {
      return '';
    }

    if (typeof fecha === 'string') {
      const iso = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (iso) {
        return `${iso[3]}/${iso[2]}/${iso[1]}`;
      }

      const latam = fecha.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
      if (latam) {
        return fecha;
      }
    }

    const d = fecha instanceof Date ? fecha : new Date(fecha);
    if (Number.isNaN(d.getTime())) {
      return '';
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private serializarUsuarios(
    usuarios: Array<{ nombre: string; rfc: string; tipo_usuario: string }>
  ): string {
    if (!usuarios.length) {
      return '';
    }

    return usuarios
      .map((usuario) => `${usuario.nombre},${usuario.rfc},${usuario.tipo_usuario}`)
      .join(';');
  }

  /**
   * @deprecated Usar crearExpedienteReworkInicial. Se conserva para consultas legacy.
   */
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
      fecha_requerimiento: paso1.fecha_recibido || paso1.fecha_documento,
      referencia_asunto: paso1.referencia_asunto,
      fecha_vencimiento: paso1.fecha_vencimiento || null, // Nuevo campo: Fecha de vencimiento del requerimiento
      plazo_vencimiento_prioridad: paso1.plazo_vencimiento_prioridad,

      // Paso 2: Seguimiento
      responsable: this.comoTexto(paso2.responsable),
      fecha_asignacion: null,
      sistema_aplicativo: paso2.sistema_aplicativo || null,
      estatus: paso2.estatus || 'PENDIENTE',
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
      comentarios_omega: paso2.observaciones_estatus || null,

      // Campos que sí se usan
      documento_pdf_nombre: paso3.documento_pdf ? paso3.documento_pdf.name : undefined,
      campos_documentos_pospuestos: paso3.campos_pospuestos || [],

      // Prioridad del expediente (asignada en captura - movida al Step 1)
      prioridad: this.prioridadComoTexto(paso1.prioridad)
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

  private comoTexto(valor: unknown): string {
    if (valor === null || valor === undefined) {
      return '';
    }

    return String(valor);
  }

  private prioridadComoTexto(prioridad: unknown): string | null {
    if (prioridad === null || prioridad === undefined || prioridad === '') {
      return null;
    }

    if (typeof prioridad === 'string') {
      return prioridad;
    }

    const id = Number(prioridad);
    const etiquetas: Record<number, string> = {
      1: 'Normal',
      2: 'Urgente',
      3: 'Extra urgente',
    };

    return etiquetas[id] ?? String(id);
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
    const url = `${TLALCALLI_BASE}expedientes/descargar-excel`;
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
