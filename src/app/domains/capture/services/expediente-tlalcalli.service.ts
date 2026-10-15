import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, from, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { LoggerService } from './logger.service';
import { ExpedienteTlalcalli } from '../interfaces/expediente-tlalcalli.interface';
import {
  ExpedienteReworkInicialPayload,
  ExpedienteReworkInicialOficioPayload,
  ExpedienteReworkInicialResponse,
  CatalogoReworkItem,
  CargaPdfReworkResponse,
  ArchivoPdfListadoItem,
  ArchivoPdfRework,
} from '../interfaces/expediente-rework.interface';
import { TemporalInsertRequest } from '../interfaces/temporal.interface';
import {
  ExpedienteDetalleCaptura,
  ExpedienteEdicionFormValores,
  ExpedienteReworkCompletoResponse,
  ExpedienteReworkConsultaRow,
  OficioAdjuntoExpediente,
  ResponseOficiosPorIdExpediente,
} from '../../tracking/interfaces/expediente-detalle-captura.interface';
import {
  TipoUsuarioRequerimiento,
  UsuarioRequerimiento,
} from '../../interfaces/usuarios-expediente.interface';
import { DateUtils } from '../utils/date-utils';
import { unirListaTexto } from '../utils/lista-texto.utils';
import {
  normalizarBlobAPdf,
  normalizarBytesAPdfBlob,
  registrarErrorPdf,
} from '../utils/pdf-bytes.utils';
import { extraerMensajeErrorHttp } from '../utils/http-error.utils';
import { CatalogoReworkCacheService } from './catalogo-rework-cache.service';
import {
  parsearRemitenteCompuesto,
  serializarRemitenteRework,
} from '../../dashboard/services/dashboard-remitente-admin.utils';

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
  /** Oficio/fechas/asunto del expediente principal (no confundir con oficios adjuntos). */
  private readonly REWORK_INICIAL_OFICIO_URL = `${TLALCALLI_BASE}expedientes_rework/inicial_oficio`;
  private readonly REWORK_CARGA_PDF_URL = `${TLALCALLI_BASE}expedientes_rework/carga_pdf`;
  private readonly REWORK_DATA_BUSQUEDA_URL = `${TLALCALLI_BASE}expedientes_rework/data_busqueda`;
  private readonly REWORK_OBTEN_PDF_URL = `${TLALCALLI_BASE}expedientes_rework/obten_pdf`;
  private readonly REWORK_OBTEN_PDF_DATA_URL = `${TLALCALLI_BASE}expedientes_rework/obten_pdf_data`;

  // EventEmitter para notificar cuando se consultan expedientes (para la tabla)
  public expedientesConsultados = new EventEmitter<ExpedienteTlalcalli[]>();

  private ultimosFiltrosConsulta: Record<string, unknown> = {};

  constructor(
    private http: HttpClient,
    private logger: LoggerService,
    private catalogoCache: CatalogoReworkCacheService
  ) {
    this.logger.debug('ExpedienteTlalcalliService inicializado - BASE_URL:', this.BASE_URL);
  }

  /**
   * Crear un nuevo expediente desde los 3 pasos del formulario
   */
  /**
   * Consultar expedientes con filtros múltiples (para bandeja de seguimiento)
   */
  /**
   * Consulta bandeja de seguimiento usando solo expedientes_rework/data_busqueda.
   * Los registros legacy (tabla expediente_tlalcalli) ya no se mezclan aquí:
   * evita duplicados y filas de prueba insertadas en desarrollo (p. ej. DEMO-FRONT-2026-001).
   */
  consultarExpedientes(filtros: Record<string, unknown>): Observable<ExpedienteTlalcalli[]> {
    this.ultimosFiltrosConsulta = { ...filtros };
    const responsableFiltro = String(filtros['responsable'] ?? '').trim().toLowerCase();
    return this.consultarExpedientesRework(filtros).pipe(
      map((rework) => {
        // id 0 es el registro "SIN-ESPECIFICAR" que el back usa como valor nulo.
        const lista = rework
          .filter((row) => Number(row.id) !== 0)
          .map((row) => this.mapReworkConsultaToLegacy(row));
        if (!responsableFiltro) {
          return lista;
        }
        return lista.filter((exp) =>
          (exp.responsable || '').toLowerCase().includes(responsableFiltro)
        );
      }),
      catchError((error) => {
        this.logger.error('Error al consultar expedientes:', error);
        return of([]);
      })
    );
  }

  /** Reejecuta la última consulta de bandeja (p. ej. tras editar un expediente). */
  reconsultarExpedientes(): Observable<ExpedienteTlalcalli[]> {
    return this.consultarExpedientes(this.ultimosFiltrosConsulta);
  }

  private consultarExpedientesRework(
    filtros: Record<string, unknown>
  ): Observable<ExpedienteReworkConsultaRow[]> {
    const payload = this.construirPayloadReworkBusqueda(filtros);
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // El backend expone GET con Json<PayloadFilters>, pero los navegadores no envían body en GET.
    return this.http.post<ExpedienteReworkConsultaRow[]>(this.REWORK_DATA_BUSQUEDA_URL, payload, {
      headers,
      withCredentials: true,
    });
  }

  private construirPayloadReworkBusqueda(filtros: Record<string, unknown>): {
    expediente: string;
    oficio: string;
    prioridad: number;
    estatus: number;
    responsable: string;
    fecha_registro_inicio: string;
    fecha_registro_fin: string;
  } {
    const prioridadId = Number(filtros['prioridad_id'] ?? 0);
    const estatusId = Number(filtros['estatus_id'] ?? 0);
    const fechaInicio =
      String(filtros['fecha_registro_inicio'] ?? filtros['fecha_creacion_desde'] ?? '').trim();
    const fechaFin = String(filtros['fecha_registro_fin'] ?? filtros['fecha_creacion_hasta'] ?? '').trim();

    return {
      expediente: String(filtros['expediente'] ?? ''),
      oficio: String(filtros['oficio'] ?? ''),
      prioridad: Number.isFinite(prioridadId) ? prioridadId : 0,
      estatus: Number.isFinite(estatusId) ? estatusId : 0,
      responsable: String(filtros['responsable'] ?? ''),
      fecha_registro_inicio: fechaInicio,
      fecha_registro_fin: fechaFin,
    };
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
    // StructForSearch solo trae `remitente` hoy; remitente_general/remitente_central cuando Max los agregue.
    const remitenteGeneral = row.remitente_general?.trim() || undefined;
    const remitenteCentral = row.remitente_central?.trim() || undefined;
    return {
      id_expediente: row.id,
      origen: 'rework',
      expediente: row.num_expediente,
      oficio: row.num_oficio,
      servicio: row.servicio,
      numero_entrada_central: row.num_entrada,
      remitente_general: remitenteGeneral,
      remitente_central: remitenteCentral,
      remitente_area: row.remitente,
      fecha_documento: row.fecha_documento,
      fecha_recibido: row.fecha_recepcion,
      fecha_creacion: row.fecha_recepcion,
      fecha_vencimiento: row.fecha_vencimiento,
      referencia_asunto: row.asunto,
      usuarios: row.usuarios,
      sistema_aplicativo: row.aplicativos ?? undefined,
      responsable: row.responsable,
      prioridad: row.prioridad,
      estatus: this.normalizarEstatusRework(row.status),
      ubicacion: row.ubicacion,
      comentarios_omega: row.observaciones ?? undefined,
    };
  }

  /** Corrige variantes del catálogo rework (p. ej. PEDIENTE) para filtros del Centro de control. */
  private normalizarEstatusRework(status: string | null | undefined): string {
    const s = (status || '').trim().toUpperCase();
    if (s === 'PEDIENTE') {
      return 'PENDIENTE';
    }
    return s;
  }

  /**
   * @deprecated GET expedientes/autocompletado es legacy y no cubre rework.
   * La bandeja filtra la tabla con POST data_busqueda (consultarExpedientes).
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
    const catalogos$ = this.catalogoCache.getCatalogosCaptura();

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
    return this.catalogoCache.getCat(numero);
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
      expediente: this.valorDetalle(expediente.expediente),
      oficio: this.valorDetalle(expediente.oficio),
      servicio: this.valorDetalle(expediente.servicio),
      numero_entrada_central: this.valorDetalle(expediente.numero_entrada_central),
      remitente: this.valorDetalle(expediente.remitente_area),
      fecha_documento: this.formatearFechaDetalle(expediente.fecha_documento),
      fecha_recepcion: this.formatearFechaDetalle(expediente.fecha_recibido),
      plazo_vencimiento: this.resolverPlazoVencimientoDetalle(
        expediente.plazo_valor,
        expediente.fecha_recibido,
        expediente.fecha_vencimiento
      ),
      fecha_vencimiento: this.formatearFechaDetalle(expediente.fecha_vencimiento),
      prioridad: this.valorDetalle(expediente.prioridad),
      asunto: this.valorDetalle(expediente.referencia_asunto),
      usuarios: [],
      aplicativos: this.valorDetalle(expediente.sistema_aplicativo),
      responsable: this.valorDetalle(expediente.responsable),
      estatus: this.valorDetalle(this.formatearEstatusLegacy(expediente.estatus)),
      ubicacion: this.valorDetalle(this.formatearUbicacionLegacy(expediente.ubicacion)),
      observaciones: this.valorDetalle(expediente.comentarios_omega),
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
      id_expediente: a.id_expediente,
      num_expediente: a.num_expediente,
      nombre_archivo: a.nombre_archivo || this.nombreDesdePath(a.path_archivo),
    }));
    const primerArchivo = archivos[0];

    return {
      id_expediente: data.id,
      origen: 'rework',
      expediente: this.valorDetalle(data.num_expediente),
      oficio: this.valorDetalle(data.num_oficio),
      servicio: this.valorDetalle(this.etiquetaCatalogo(catalogos.servicios, data.servicio)),
      numero_entrada_central: this.valorDetalle(data.num_entrada),
      remitente: this.valorDetalle(data.remitente),
      fecha_documento: this.formatearFechaDetalle(data.fecha_documento),
      fecha_recepcion: this.formatearFechaDetalle(data.fecha_recepcion),
      plazo_vencimiento: this.resolverPlazoVencimientoDetalle(
        null,
        data.fecha_recepcion,
        data.fecha_vencimiento
      ),
      fecha_vencimiento: this.formatearFechaDetalle(data.fecha_vencimiento),
      prioridad: this.valorDetalle(this.etiquetaCatalogo(catalogos.prioridades, data.prioridad)),
      asunto: this.valorDetalle(data.asunto),
      usuarios: this.parsearUsuarios(data.usuarios),
      aplicativos: this.valorDetalle(data.aplicativos),
      responsable: this.valorDetalle(data.responsable),
      estatus: this.valorDetalle(this.etiquetaCatalogo(catalogos.estatus, data.status)),
      ubicacion: this.valorDetalle(this.etiquetaCatalogo(catalogos.ubicaciones, data.ubicacion)),
      observaciones: this.valorDetalle(data.observaciones),
      servicio_id: data.servicio,
      prioridad_id: data.prioridad,
      status_id: data.status,
      ubicacion_id: data.ubicacion,
      documento_pdf_nombre: primerArchivo?.nombre_archivo ?? expediente.documento_pdf_nombre ?? null,
      tiene_pdf: archivos.length > 0 || !!(expediente.documento_pdf_nombre && (data.num_oficio || expediente.oficio)),
      id_archivo_pdf: primerArchivo?.id_archivo ?? null,
      archivos_pdf: archivos,
    };
  }

  /**
   * Plazo en días hábiles para consulta: usa valor persistido si existe;
   * si no, lo infiere de fecha_recepcion y fecha_vencimiento (rework no persiste plazo).
   * Max podría exponer `plazo_vencimiento_dias_habiles` en expediente_tlalcalli_rework y StructForSearch.
   */
  private resolverPlazoVencimientoDetalle(
    plazoPersistido: number | string | null | undefined,
    fechaRecepcion: string | Date | null | undefined,
    fechaVencimiento: string | Date | null | undefined
  ): string {
    const plazoNumero = Number(plazoPersistido);
    if (Number.isFinite(plazoNumero) && plazoNumero > 0) {
      return String(plazoNumero);
    }

    const calculado = DateUtils.contarDiasHabilesDesdeRecepcion(
      fechaRecepcion,
      fechaVencimiento
    );

    if (calculado != null && calculado > 0) {
      return String(calculado);
    }

    return '-';
  }

  private valorDetalle(valor: string | number | null | undefined): string {
    if (valor == null) {
      return '-';
    }

    const normalizado = String(valor).trim();
    if (!normalizado || normalizado.toLowerCase() === 'n/a') {
      return '-';
    }

    return normalizado;
  }

  private etiquetaCatalogo(catalogo: CatalogoReworkItem[], id: number): string {
    const item = catalogo.find((c) => c.id_exp === id);
    if (!item) {
      return '-';
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
    return DateUtils.formatearFechaDisplay(fecha);
  }

  private formatearEstatusLegacy(estatus: string | undefined): string {
    if (!estatus) {
      return '-';
    }

    return estatus.replace(/_/g, ' ');
  }

  private formatearUbicacionLegacy(ubicacion: string | undefined): string {
    if (!ubicacion) {
      return '-';
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
   * Actualiza captura rework completa (paso 1+2).
   * PUT expedientes_rework/inicial — filtra por num_expediente; respuesta 200 "OK".
   *
   * Cuándo usar cada PUT del expediente principal:
   * - inicial: modal de edición (lápiz), 8 campos de seguimiento + valores congelados del detalle.
   * - inicial_oficio: num_oficio, fechas y asunto del oficio PRINCIPAL (futuro formulario de oficio).
   * - completo/{id}: otro flujo Max; no sustituye inicial ni inicial_oficio.
   *
   * Oficios adjuntos (tab documentos) son entidad distinta; PUT .../{id}/oficios (fallback local solo en error).
   */
  actualizarExpedienteReworkInicial(
    payload: ExpedienteReworkInicialPayload
  ): Observable<{ mensaje: string }> {
    this.logger.debug('PUT expedientes_rework/inicial', payload);

    return this.http
      .put(this.REWORK_INICIAL_URL, payload, {
        withCredentials: true,
        responseType: 'text',
      })
      .pipe(
        map(() => ({ mensaje: 'Expediente actualizado correctamente' })),
        catchError((error) => {
          const mensajeUsuario = extraerMensajeErrorHttp(
            error,
            'No se pudo actualizar el expediente en servidor.'
          );
          return throwError(() => ({ ...error, mensajeUsuario }));
        })
      );
  }

  /**
   * Actualiza oficio/fechas/asunto del expediente principal (no oficios adjuntos).
   * PUT expedientes_rework/inicial_oficio — filtra por num_expediente.
   * Fechas en formato dd/mm/yyyy. Errores: 500 { mensaje } o 500 { error } (pool BD).
   */
  actualizarExpedienteReworkInicialOficio(
    payload: ExpedienteReworkInicialOficioPayload
  ): Observable<{ mensaje: string }> {
    this.logger.debug('PUT expedientes_rework/inicial_oficio', payload);

    return this.http
      .put(this.REWORK_INICIAL_OFICIO_URL, payload, {
        withCredentials: true,
        responseType: 'text',
      })
      .pipe(
        map(() => ({ mensaje: 'Oficio del expediente actualizado correctamente' })),
        catchError((error) => {
          const mensajeUsuario = extraerMensajeErrorHttp(
            error,
            'No se pudo actualizar el oficio del expediente en servidor.'
          );
          return throwError(() => ({ ...error, mensajeUsuario }));
        })
      );
  }

  obtenerCatalogosCaptura(): Observable<{
    servicios: CatalogoReworkItem[];
    prioridades: CatalogoReworkItem[];
    estatus: CatalogoReworkItem[];
    ubicaciones: CatalogoReworkItem[];
  }> {
    return this.catalogoCache.getCatalogosCaptura();
  }

  /**
   * Payload PUT inicial para el modal de edición (8 campos editables).
   * Oficio, fechas, asunto, remitente y prioridad se toman del detalle sin cambios.
   */
  construirPayloadReworkEdicionSeguimiento(
    valores: ExpedienteEdicionFormValores,
    detalle: ExpedienteDetalleCaptura
  ): ExpedienteReworkInicialPayload {
    return {
      num_expediente: valores.expediente.trim(),
      num_oficio: valores.oficio.trim(),
      servicio: this.comoIdCatalogo(valores.servicio, 0),
      num_entrada: valores.numero_entrada_central.trim(),
      remitente: this.remitenteReworkDesdeEdicion(valores.remitente, detalle.remitente),
      fecha_documento: this.formatearFechaRework(valores.fecha_documento),
      fecha_recepcion: this.formatearFechaRework(valores.fecha_recepcion),
      prioridad: this.comoIdCatalogo(valores.prioridad ?? detalle.prioridad_id, 1),
      fecha_vencimiento: this.formatearFechaRework(valores.fecha_vencimiento),
      asunto: valores.asunto.trim(),
      usuarios: this.serializarUsuarios(valores.usuarios),
      aplicativos: unirListaTexto(valores.aplicativos),
      responsable: unirListaTexto(valores.responsable),
      status: this.comoIdCatalogo(valores.status, 0),
      observaciones: valores.observaciones.trim(),
      ubicacion: this.comoIdCatalogo(valores.ubicacion, 1),
    };
  }

  /** Payload PUT inicial_oficio — datos del oficio principal del expediente. */
  construirPayloadReworkInicialOficio(valores: {
    num_expediente: string;
    num_oficio: string;
    fecha_documento: string;
    fecha_recepcion: string;
    fecha_vencimiento: string;
    asunto: string;
  }): ExpedienteReworkInicialOficioPayload {
    return {
      num_expediente: valores.num_expediente.trim(),
      num_oficio: valores.num_oficio.trim(),
      fecha_documento: this.formatearFechaRework(valores.fecha_documento),
      fecha_recepcion: this.formatearFechaRework(valores.fecha_recepcion),
      fecha_vencimiento: this.formatearFechaRework(valores.fecha_vencimiento),
      asunto: valores.asunto.trim(),
    };
  }

  aplicarEdicionADetalle(
    detalle: ExpedienteDetalleCaptura,
    valores: ExpedienteEdicionFormValores,
    catalogos: {
      servicios: CatalogoReworkItem[];
      prioridades: CatalogoReworkItem[];
      estatus: CatalogoReworkItem[];
      ubicaciones: CatalogoReworkItem[];
    }
  ): ExpedienteDetalleCaptura {
    return {
      ...detalle,
      expediente: valores.expediente.trim(),
      oficio: valores.oficio.trim(),
      servicio: this.etiquetaCatalogo(catalogos.servicios, this.comoIdCatalogo(valores.servicio, 0)),
      numero_entrada_central: valores.numero_entrada_central.trim(),
      remitente: valores.remitente.trim(),
      fecha_documento: this.formatearFechaDetalle(valores.fecha_documento),
      fecha_recepcion: this.formatearFechaDetalle(valores.fecha_recepcion),
      prioridad: this.etiquetaCatalogo(catalogos.prioridades, this.comoIdCatalogo(valores.prioridad, 1)),
      fecha_vencimiento: this.formatearFechaDetalle(valores.fecha_vencimiento),
      plazo_vencimiento: this.resolverPlazoVencimientoDetalle(
        null,
        valores.fecha_recepcion,
        valores.fecha_vencimiento
      ),
      asunto: valores.asunto.trim(),
      usuarios: [...valores.usuarios],
      aplicativos: unirListaTexto(valores.aplicativos),
      responsable: unirListaTexto(valores.responsable),
      estatus: this.etiquetaCatalogo(catalogos.estatus, this.comoIdCatalogo(valores.status, 0)),
      observaciones: valores.observaciones.trim(),
      ubicacion: this.etiquetaCatalogo(catalogos.ubicaciones, this.comoIdCatalogo(valores.ubicacion, 1)),
      servicio_id: this.comoIdCatalogo(valores.servicio, 0),
      prioridad_id: this.comoIdCatalogo(valores.prioridad, 1),
      status_id: this.comoIdCatalogo(valores.status, 0),
      ubicacion_id: this.comoIdCatalogo(valores.ubicacion, 1),
    };
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
   * Lista PDFs del expediente rework.
   * Backend: GET expedientes_rework/archivos_pdf/obten_listado (listado global; filtrar por id_expediente).
   */
  listarArchivosPdfRework(idExpediente: number): Observable<ArchivoPdfRework[]> {
    return this.http
      .get<ArchivoPdfListadoItem[]>(
        `${TLALCALLI_BASE}expedientes_rework/archivos_pdf/obten_listado`,
        { withCredentials: true }
      )
      .pipe(
        map((archivos) =>
          (archivos ?? [])
            .filter((archivo) => archivo.id_expediente === idExpediente)
            .map((archivo) => ({
              id_archivo: archivo.id_archivo,
              id_expediente: archivo.id_expediente,
              num_expediente: archivo.num_expediente,
              path_archivo: archivo.path,
              nombre_archivo: this.nombreDesdePath(archivo.path),
            }))
        ),
        catchError(() => of([]))
      );
  }

  /**
   * Obtiene PDF por id_archivo: intenta obten_pdf_data (bytes) y cae a obten_pdf (blob).
   *
   * Ambas rutas pasan por `normalizar*` porque el handler de `obten_pdf_data` no
   * fija Content-Type y no hay garantía de que la respuesta sean bytes crudos:
   * si llega como arreglo JSON o base64, el Blob directo sería un PDF corrupto
   * (visor en blanco y descarga inservible, pese al 200).
   */
  descargarPdfReworkArchivo(idArchivo: number): Observable<Blob> {
    const desdeObtenPdf = () =>
      this.http
        .get(`${this.REWORK_OBTEN_PDF_URL}/${idArchivo}`, {
          withCredentials: true,
          responseType: 'blob',
        })
        .pipe(switchMap((blob) => from(normalizarBlobAPdf(blob))));

    return this.http
      .get(`${this.REWORK_OBTEN_PDF_DATA_URL}/${idArchivo}`, {
        withCredentials: true,
        responseType: 'arraybuffer',
      })
      .pipe(
        map((buffer) => normalizarBytesAPdfBlob(buffer)),
        catchError((error) => {
          registrarErrorPdf(
            `obten_pdf_data/${idArchivo} no usable, se intenta obten_pdf/${idArchivo}`,
            error
          );
          return desdeObtenPdf();
        }),
        catchError((error) => {
          registrarErrorPdf(`No se pudo obtener el PDF ${idArchivo}`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * GET expedientes_rework/{id}/oficios — array de oficios o un solo objeto (legacy).
   */
  obtenerOficiosPorExpedienteRework(idExpediente: number): Observable<OficioAdjuntoExpediente[]> {
    const url = `${TLALCALLI_BASE}expedientes_rework/${idExpediente}/oficios`;

    return this.http
      .get<ResponseOficiosPorIdExpediente | ResponseOficiosPorIdExpediente[]>(url, {
        withCredentials: true,
      })
      .pipe(
        map((respuesta) => this.normalizarRespuestaOficiosApi(respuesta)),
        catchError((error) => {
          const status = error?.status;
          if (status === 500 || status === 404) {
            this.logger.warn(
              'GET oficios sin datos (sin PDF join o expediente sin archivos)',
              { idExpediente, status }
            );
          } else {
            this.logger.warn('GET oficios por expediente no disponible', error);
          }
          return of([]);
        })
      );
  }

  /**
   * Dos oficios representan el mismo documento.
   * En servidor la clave es id_archivo (varios PDF comparten num_oficio del expediente).
   * Entre local y servidor se empareja por localId o nombre de PDF, no solo por num_oficio.
   */
  esMismoOficioAdjunto(a: OficioAdjuntoExpediente, b: OficioAdjuntoExpediente): boolean {
    if (a.id_archivo != null && b.id_archivo != null) {
      return a.id_archivo === b.id_archivo;
    }

    if (a.localId && b.localId && a.localId === b.localId) {
      return true;
    }

    const nomA = this.normalizarNombreArchivo(a.nombre_archivo);
    const nomB = this.normalizarNombreArchivo(b.nombre_archivo);
    if (nomA && nomB && nomA === nomB) {
      return true;
    }

    const numA = this.normalizarTextoOficio(a.num_oficio);
    const numB = this.normalizarTextoOficio(b.num_oficio);
    return !!(numA && numB && numA === numB && !nomA && !nomB);
  }

  /** Prefiere registros del servidor sobre los marcados como LOCAL. */
  deduplicarOficiosAdjuntos(oficios: OficioAdjuntoExpediente[]): OficioAdjuntoExpediente[] {
    const resultado: OficioAdjuntoExpediente[] = [];

    for (const candidato of oficios) {
      const indice = resultado.findIndex((existente) => this.esMismoOficioAdjunto(existente, candidato));
      if (indice < 0) {
        resultado.push(candidato);
        continue;
      }

      const existente = resultado[indice];
      if (existente.pendiente_endpoint !== false && candidato.pendiente_endpoint === false) {
        resultado[indice] = candidato;
      }
    }

    return resultado;
  }

  /**
   * Oficios adjuntos del expediente (GET devuelve listado completo cuando hay varios PDF).
   */
  cargarOficiosAdjuntosCompletos(idExpediente: number): Observable<OficioAdjuntoExpediente[]> {
    return this.obtenerOficiosPorExpedienteRework(idExpediente).pipe(
      map((oficios) => this.deduplicarOficiosAdjuntos(oficios))
    );
  }

  /**
   * PUT multipart PDF: expedientes_rework/{id_expediente}/oficios/{id_archivo}
   */
  actualizarOficioAdjuntoPdfRework(
    idExpediente: number,
    idArchivo: number,
    pdf: File
  ): Observable<{ mensaje: string; id: number }> {
    const url = `${TLALCALLI_BASE}expedientes_rework/${idExpediente}/oficios/${idArchivo}`;
    const formData = new FormData();
    formData.append('pdf', pdf, pdf.name);

    this.logger.debug('PUT oficio adjunto PDF rework', {
      url,
      id_expediente: idExpediente,
      id_archivo: idArchivo,
      archivo: pdf.name,
    });

    return this.http.put<{ mensaje: string; id: number }>(url, formData, { withCredentials: true });
  }

  /**
   * Workaround: El backend sobrescribe num_oficio, fechas y asunto del expediente
   * para todos los PDFs. Esta función parsea los valores concatenados con `|`
   * y asigna cada parte al PDF correspondiente por índice (ordenado por id_archivo ascendente).
   */
  private normalizarRespuestaOficiosApi(
    respuesta: ResponseOficiosPorIdExpediente | ResponseOficiosPorIdExpediente[] | null | undefined
  ): OficioAdjuntoExpediente[] {
    if (respuesta == null) {
      return [];
    }

    const items = Array.isArray(respuesta) ? respuesta : [respuesta];
    const validItems = items.filter((item) => item?.id_archivo != null);

    if (validItems.length === 0) {
      return [];
    }

    // Ordenar por id_archivo ascendente para mantener correspondencia con valores concatenados
    const sortedItems = [...validItems].sort((a, b) => a.id_archivo - b.id_archivo);

    // El primer item contiene los valores concatenados (todos tienen el mismo valor por el JOIN)
    const primerItem = sortedItems[0];
    const valoresConcatenados = {
      num_oficio: this.parsearCamposConcatenados(primerItem.num_oficio),
      fecha_documento: this.parsearCamposConcatenados(primerItem.fecha_documento),
      fecha_recepcion: this.parsearCamposConcatenados(primerItem.fecha_recepcion),
      fecha_vencimiento: this.parsearCamposConcatenados(primerItem.fecha_vencimiento),
      asunto: this.parsearCamposConcatenados(primerItem.asunto),
    };

    return sortedItems.map((item, index) =>
      this.mapResponseOficioToAdjuntoConIndice(item, index, valoresConcatenados)
    );
  }

  /**
   * Parsea un campo que puede contener valores concatenados con `|`.
   * @returns Array con cada valor separado, o array con el valor único si no hay separador.
   */
  private parsearCamposConcatenados(valor: string | null | undefined): string[] {
    if (!valor || valor.trim() === '' || valor === '-' || valor === '—') {
      return [];
    }
    return valor.split('|').map((v) => v.trim());
  }

  /**
   * Mapea un item de respuesta de oficios asignando el valor correspondiente
   * según su índice en el array ordenado por id_archivo.
   */
  private mapResponseOficioToAdjuntoConIndice(
    item: ResponseOficiosPorIdExpediente,
    indice: number,
    valoresConcatenados: {
      num_oficio: string[];
      fecha_documento: string[];
      fecha_recepcion: string[];
      fecha_vencimiento: string[];
      asunto: string[];
    }
  ): OficioAdjuntoExpediente {
    // Obtener el valor correspondiente por índice, o usar el último si hay menos valores
    const obtenerValorPorIndice = (valores: string[]): string | undefined => {
      if (valores.length === 0) {
        return undefined;
      }
      // Si hay menos valores que archivos, el archivo no tiene valor asignado aún
      if (indice >= valores.length) {
        return undefined;
      }
      const valor = valores[indice]?.trim();
      return valor && valor !== '-' && valor !== '—' ? valor : undefined;
    };

    const numOficio = obtenerValorPorIndice(valoresConcatenados.num_oficio);
    const fechaDocumento = obtenerValorPorIndice(valoresConcatenados.fecha_documento);
    const fechaRecepcion = obtenerValorPorIndice(valoresConcatenados.fecha_recepcion);
    const fechaVencimiento = obtenerValorPorIndice(valoresConcatenados.fecha_vencimiento);
    const asunto = obtenerValorPorIndice(valoresConcatenados.asunto);

    return {
      id: item.id_archivo,
      id_archivo: item.id_archivo,
      localId: `api-${item.id_archivo}`,
      num_oficio: numOficio || '-',
      fecha_documento: fechaDocumento ? this.fechaOficioDesdeApi(fechaDocumento) : undefined,
      fecha_recepcion: fechaRecepcion ? this.fechaOficioDesdeApi(fechaRecepcion) : undefined,
      fecha_vencimiento: fechaVencimiento ? this.fechaOficioDesdeApi(fechaVencimiento) : undefined,
      asunto: asunto || undefined,
      nombre_archivo: this.nombreDesdePath(item.path_archivo),
      pendiente_endpoint: false,
    };
  }

  /** @deprecated Usar mapResponseOficioToAdjuntoConIndice con valores concatenados */
  private mapResponseOficioToAdjunto(item: ResponseOficiosPorIdExpediente): OficioAdjuntoExpediente {
    return {
      id: item.id_archivo,
      id_archivo: item.id_archivo,
      localId: `api-${item.id_archivo}`,
      num_oficio: item.num_oficio?.trim() || '-',
      fecha_documento: this.fechaOficioDesdeApi(item.fecha_documento),
      fecha_recepcion: this.fechaOficioDesdeApi(item.fecha_recepcion),
      fecha_vencimiento: this.fechaOficioDesdeApi(item.fecha_vencimiento),
      asunto: item.asunto?.trim() || undefined,
      nombre_archivo: this.nombreDesdePath(item.path_archivo),
      pendiente_endpoint: false,
    };
  }

  private fechaOficioDesdeApi(fecha: string | undefined): string | undefined {
    const display = DateUtils.formatearFechaDisplay(fecha);
    return display === '—' ? undefined : display;
  }

  private normalizarTextoOficio(valor: string | null | undefined): string {
    const texto = valor?.trim().toLowerCase();
    if (!texto || texto === '-' || texto === '—') {
      return '';
    }
    return texto;
  }

  private normalizarNombreArchivo(valor: string | null | undefined): string {
    const nombre = valor?.trim().toLowerCase().replace(/\.pdf$/i, '');
    return nombre || '';
  }

  /**
   * PUT oficio adjunto a expediente rework.
   * PUT expedientes_rework/{id}/oficios — form-data: pdf, num_oficio, fechas, asunto.
   * Respuesta PUT: { id, mensaje }; el listado completo se obtiene con GET /oficios.
   *
   * WORKAROUND: El backend sobrescribe num_oficio, fechas y asunto para todos los PDFs.
   * Esta función obtiene los valores actuales (GET), concatena el nuevo valor con `|`,
   * y envía el PUT con strings concatenados para preservar los valores de cada oficio.
   */
  guardarOficioAdjuntoRework(
    idExpediente: number,
    oficio: OficioAdjuntoExpediente,
    pdf: File
  ): Observable<OficioAdjuntoExpediente[]> {
    // Primero obtener los valores actuales para concatenar
    return this.obtenerOficiosPorExpedienteRework(idExpediente).pipe(
      switchMap((oficiosActuales) => {
        // Construir valores concatenados con el nuevo oficio
        const valoresConcatenados = this.construirValoresConcatenados(oficiosActuales, oficio);

        const url = `${TLALCALLI_BASE}expedientes_rework/${idExpediente}/oficios`;
        const formData = new FormData();
        formData.append('num_oficio', valoresConcatenados.num_oficio);

        this.agregarCampoFormData(formData, 'fecha_documento', valoresConcatenados.fecha_documento);
        this.agregarCampoFormData(formData, 'fecha_recepcion', valoresConcatenados.fecha_recepcion);
        this.agregarCampoFormData(formData, 'fecha_vencimiento', valoresConcatenados.fecha_vencimiento);
        this.agregarCampoFormData(formData, 'asunto', valoresConcatenados.asunto);
        formData.append('pdf', pdf, pdf.name);

        this.logger.debug('PUT oficio adjunto rework (workaround concatenación)', {
          url,
          id_expediente: idExpediente,
          num_oficio_original: oficio.num_oficio,
          num_oficio_concatenado: valoresConcatenados.num_oficio,
          oficios_existentes: oficiosActuales.length,
          archivo: pdf.name,
        });

        return this.http
          .put<ResponseOficiosPorIdExpediente | ResponseOficiosPorIdExpediente[] | { id: number; mensaje: string }>(
            url,
            formData,
            { withCredentials: true }
          )
          .pipe(
            switchMap((respuesta) => {
              if (Array.isArray(respuesta)) {
                return of(this.normalizarRespuestaOficiosApi(respuesta));
              }
              return this.obtenerOficiosPorExpedienteRework(idExpediente);
            }),
            map((oficios) => this.deduplicarOficiosAdjuntos(oficios))
          );
      }),
      catchError((error) => {
        this.logger.warn('Oficios adjuntos: PUT no disponible o falló, usar guardado local', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * WORKAROUND: Construye strings concatenados con `|` para preservar valores de cada oficio.
   * Los valores existentes se mantienen en orden de id_archivo ascendente,
   * y el nuevo oficio se agrega al final.
   */
  /**
   * Eliminación lógica de oficio adjunto (soft delete en archivos_pdf).
   * PUT expedientes_rework/{id_expediente}/oficio/{id_archivo}
   */
  eliminarOficioAdjuntoRework(
    idExpediente: number,
    idArchivo: number
  ): Observable<{ mensaje: string }> {
    const url = `${TLALCALLI_BASE}expedientes_rework/${idExpediente}/oficio/${idArchivo}`;
    return this.http.put<{ mensaje: string }>(url, {}, { withCredentials: true });
  }

  /**
   * Sincroniza metadatos concatenados de adjuntos vía PUT inicial_oficio (sin nuevo PDF).
   */
  sincronizarMetadatosOficiosAdjuntosRework(
    numExpediente: string,
    oficios: OficioAdjuntoExpediente[]
  ): Observable<{ mensaje: string }> {
    const concatenados = this.construirConcatenacionDesdeLista(oficios);
    return this.actualizarExpedienteReworkInicialOficio(
      this.construirPayloadReworkInicialOficio({
        num_expediente: numExpediente,
        num_oficio: concatenados.num_oficio,
        fecha_documento: concatenados.fecha_documento,
        fecha_recepcion: concatenados.fecha_recepcion,
        fecha_vencimiento: concatenados.fecha_vencimiento,
        asunto: concatenados.asunto,
      })
    );
  }

  /** Arma strings concatenados con `|` desde la lista actual (orden id_archivo). */
  construirConcatenacionDesdeLista(oficios: OficioAdjuntoExpediente[]): {
    num_oficio: string;
    fecha_documento: string;
    fecha_recepcion: string;
    fecha_vencimiento: string;
    asunto: string;
  } {
    const ordenados = [...oficios]
      .filter((o) => o.id_archivo != null)
      .sort((a, b) => (a.id_archivo ?? 0) - (b.id_archivo ?? 0));

    return {
      num_oficio: ordenados.map((o) => this.valorParaConcatenar(o.num_oficio)).join('|'),
      fecha_documento: ordenados.map((o) => this.fechaParaConcatenar(o.fecha_documento)).join('|'),
      fecha_recepcion: ordenados.map((o) => this.fechaParaConcatenar(o.fecha_recepcion)).join('|'),
      fecha_vencimiento: ordenados.map((o) => this.fechaParaConcatenar(o.fecha_vencimiento)).join('|'),
      asunto: ordenados.map((o) => this.valorParaConcatenar(o.asunto)).join('|'),
    };
  }

  private construirValoresConcatenados(
    oficiosExistentes: OficioAdjuntoExpediente[],
    nuevoOficio: OficioAdjuntoExpediente
  ): {
    num_oficio: string;
    fecha_documento: string;
    fecha_recepcion: string;
    fecha_vencimiento: string;
    asunto: string;
  } {
    // Ordenar por id_archivo ascendente para mantener correspondencia
    const ordenados = [...oficiosExistentes]
      .filter((o) => o.id_archivo != null)
      .sort((a, b) => (a.id_archivo ?? 0) - (b.id_archivo ?? 0));

    // Extraer valores existentes de cada oficio
    const valoresExistentes = {
      num_oficio: ordenados.map((o) => this.valorParaConcatenar(o.num_oficio)),
      fecha_documento: ordenados.map((o) => this.fechaParaConcatenar(o.fecha_documento)),
      fecha_recepcion: ordenados.map((o) => this.fechaParaConcatenar(o.fecha_recepcion)),
      fecha_vencimiento: ordenados.map((o) => this.fechaParaConcatenar(o.fecha_vencimiento)),
      asunto: ordenados.map((o) => this.valorParaConcatenar(o.asunto)),
    };

    // Agregar valores del nuevo oficio al final
    valoresExistentes.num_oficio.push(this.valorParaConcatenar(nuevoOficio.num_oficio));
    valoresExistentes.fecha_documento.push(this.fechaParaConcatenar(nuevoOficio.fecha_documento));
    valoresExistentes.fecha_recepcion.push(this.fechaParaConcatenar(nuevoOficio.fecha_recepcion));
    valoresExistentes.fecha_vencimiento.push(this.fechaParaConcatenar(nuevoOficio.fecha_vencimiento));
    valoresExistentes.asunto.push(this.valorParaConcatenar(nuevoOficio.asunto));

    // Concatenar con separador `|`
    return {
      num_oficio: valoresExistentes.num_oficio.join('|'),
      fecha_documento: valoresExistentes.fecha_documento.join('|'),
      fecha_recepcion: valoresExistentes.fecha_recepcion.join('|'),
      fecha_vencimiento: valoresExistentes.fecha_vencimiento.join('|'),
      asunto: valoresExistentes.asunto.join('|'),
    };
  }

  /**
   * Normaliza un valor para concatenación: vacíos se convierten en cadena vacía.
   */
  private valorParaConcatenar(valor: string | null | undefined): string {
    if (!valor || valor === '-' || valor === '—') {
      return '';
    }
    return valor.trim();
  }

  /** El back calcula vencidos con TO_DATE(…, 'DD/MM/YYYY'); un segmento ISO rompe la consulta. */
  private fechaParaConcatenar(valor: string | null | undefined): string {
    const limpio = this.valorParaConcatenar(valor);
    return limpio ? this.formatearFechaRework(limpio) : '';
  }

  private agregarCampoFormData(formData: FormData, clave: string, valor: string | undefined): void {
    if (valor?.trim()) {
      formData.append(clave, valor.trim());
    }
  }

  private nombreDesdePath(path: string): string {
    if (!path) {
      return 'documento.pdf';
    }
    const partes = path.replace(/\\/g, '/').split('/');
    return partes[partes.length - 1] || 'documento.pdf';
  }

  /** Payload compartido entre expedientes_rework/inicial y temporal/insert */
  construirPayloadTemporal(paso1: any, paso2: any): TemporalInsertRequest {
    return this.construirPayloadReworkInicial(paso1, paso2);
  }

  parsearUsuariosCadena(cadena: string | null | undefined): UsuarioRequerimiento[] {
    return this.parsearUsuarios(cadena);
  }

  /** Conserva GENERAL,CENTRAL al editar solo el identificador en Consulta. */
  private remitenteReworkDesdeEdicion(identificadorForm: string, remitenteBd: string): string {
    const identificador = identificadorForm.trim();
    const compuesto = parsearRemitenteCompuesto(remitenteBd);
    if (compuesto) {
      const id =
        identificador.length > 50 ? identificador.substring(0, 50) : identificador;
      return `${compuesto.generalClave},${compuesto.centralClave},${id}`;
    }
    return serializarRemitenteRework({ remitente_area: identificador });
  }

  private construirPayloadReworkInicial(paso1: any, paso2: any): ExpedienteReworkInicialPayload {
    const usuarios = Array.isArray(paso2?.usuarios)
      ? paso2.usuarios
      : Array.isArray(paso1.usuarios)
        ? paso1.usuarios
        : [];

    return {
      num_expediente: paso1.expediente || '',
      num_oficio: paso1.oficio || '',
      servicio: this.comoIdCatalogo(paso1.servicio ?? paso1.id_servicio, 0),
      num_entrada: paso1.numero_entrada_central || '',
      remitente: serializarRemitenteRework({
        remitente_general: paso1.remitente_general,
        remitente_central: paso1.remitente_central,
        remitente_identificador: paso1.remitente_identificador,
        remitente_area: paso1.remitente_area,
      }),
      fecha_documento: this.formatearFechaRework(paso1.fecha_documento),
      fecha_recepcion: this.formatearFechaRework(paso1.fecha_recibido),
      prioridad: this.comoIdCatalogo(paso1.prioridad ?? paso1.id_prioridad, 1),
      fecha_vencimiento: this.formatearFechaRework(paso1.fecha_vencimiento),
      asunto: paso1.referencia_asunto || '',
      usuarios: this.serializarUsuarios(usuarios),
      aplicativos: unirListaTexto(paso2.sistema_aplicativo),
      responsable: unirListaTexto(this.comoTexto(paso2.responsable)),
      status: this.comoIdCatalogo(paso2.status ?? paso2.estatus ?? paso2.id_estatus, 0),
      observaciones: paso2.observaciones_estatus || '',
      ubicacion: this.comoIdCatalogo(paso2.ubicacion ?? paso2.id_ubicacion, 1)
    };
  }

  /** Backend espera i32; rechaza etiquetas de catálogo como "buscar" o "PENDIENTE". */
  private comoIdCatalogo(valor: unknown, defecto: number): number {
    if (valor === null || valor === undefined || valor === '') {
      return defecto;
    }

    if (typeof valor === 'number' && Number.isFinite(valor)) {
      return Math.trunc(valor);
    }

    if (typeof valor === 'string') {
      const trimmed = valor.trim();
      if (/^\d+$/.test(trimmed)) {
        return Number(trimmed);
      }
    }

    return defecto;
  }

  private formatearFechaRework(fecha: Date | string | undefined | null): string {
    if (!fecha) {
      return '';
    }

    if (typeof fecha === 'string') {
      if (fecha.includes('|')) {
        return fecha
          .split('|')
          .map((segmento) => (segmento.trim() ? this.formatearFechaRework(segmento.trim()) : ''))
          .join('|');
      }

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
