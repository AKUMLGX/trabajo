import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

const TLALCALLI_BASE = environment.baseUrl.endsWith('/') ? environment.baseUrl : `${environment.baseUrl}/`;
const BASE_URL = `${TLALCALLI_BASE}seguimiento_asignacion`;

export const OPCIONES_OFICIO_INFO = ['Solicitud de información', 'Entrega de información', 'N/A'] as const;
export const OPCIONES_OFICIO_COMISION = ['Comisión', 'Apoyo', 'N/A'] as const;
export const OPCIONES_OFICIO_DESIGNACION = ['Designación', 'Aceptación', 'N/A'] as const;
export const OPCIONES_ACTAS = [
  'Acta de Hechos',
  'Memoria Técnica',
  'Cadena de Custodia',
  'Reporte de Diligencia',
  'N/A',
] as const;
export const OPCIONES_ENTREGABLE = ['Dictamen', 'Reporte', 'N/A'] as const;

/** Ticket o WOOS; fechas en formato YYYY-MM-DD. */
export interface ItemCompromiso {
  numero: string;
  fecha_apertura?: string | null;
  fecha_compromiso?: string | null;
  cerrado: boolean;
  fecha_cierre?: string | null;
}

export type GrupoEspecialista = 'ANALISTA' | 'QA_TECNICO' | 'QA_LEGAL' | 'QA_INTERNO' | 'CORRELACION';

export interface Especialista {
  id_especialista: number;
  codigo: string;
  nombre_completo: string;
  grupo: GrupoEspecialista;
  etiqueta?: string | null;
  activo: boolean;
  email?: string | null;
  /** El GET aún no siempre lo devuelve; obligatorio en POST/PUT (`b12f73f`). */
  rfc?: string | null;
}

export interface EspecialistaPayload {
  nombre_completo: string;
  grupo: GrupoEspecialista;
  etiqueta?: string | null;
  activo?: boolean;
  /** Obligatorio en el back: minúsculas, `@sat.gob.mx`, máximo 100 caracteres. */
  email: string;
  /** Obligatorio: persona física o moral en mayúsculas (validación del back). */
  rfc: string;
}

/** Ids de especialistas asignados por grupo. */
export interface AsignacionesSeguimiento {
  analistas: number[];
  qa_tecnico: number[];
  qa_legal: number[];
  qa_interno: number[];
  correlacion: number[];
}

export const GRUPOS_ESPECIALISTA: { grupo: GrupoEspecialista; clave: keyof AsignacionesSeguimiento; titulo: string }[] = [
  { grupo: 'ANALISTA', clave: 'analistas', titulo: 'Analistas' },
  { grupo: 'QA_TECNICO', clave: 'qa_tecnico', titulo: 'QA Técnico' },
  { grupo: 'QA_LEGAL', clave: 'qa_legal', titulo: 'QA Legal' },
  { grupo: 'QA_INTERNO', clave: 'qa_interno', titulo: 'QA Interno' },
  { grupo: 'CORRELACION', clave: 'correlacion', titulo: 'Correlación' },
];

export interface SeguimientoAcciones {
  id_expediente: number;
  oficio_solicitud_info: string;
  oficio_comision_apoyo: string;
  oficio_designacion_aceptacion: string;
  actas_hechos_memorias: string;
  tickets: ItemCompromiso[];
  wos: ItemCompromiso[];
  entregable: string;
  anexos: string;
  asignaciones: AsignacionesSeguimiento;
  fecha_actualizacion?: string | null;
  usuario_actualizacion?: string | null;
}

export interface ResumenSeguimiento {
  id_expediente: number;
  acciones_registradas: number;
  tickets_abiertos: number;
  wos_abiertos: number;
  compromisos_vencidos: number;
  entregable: string;
  analistas_asignados: string;
  /** Solo en resumen rol 001 (supervisión); el 003 no los recibe. */
  qa_legal_asignados?: string;
  qa_tecnico_asignados?: string;
  qa_interno_asignados?: string;
  correlacion_asignados?: string;
  /** Marca que el asunto ya se notificó y pasó a Atención y cierre. */
  fecha_notificacion_asignacion?: string | null;
}

export interface DestinatarioAsignacion {
  id_especialista: number;
  nombre: string;
  correo: string;
  grupos: GrupoEspecialista[];
}

export interface NotificacionAsignacionPayload {
  id_expediente: number;
  num_expediente: string;
  num_oficio: string;
  destinatarios: DestinatarioAsignacion[];
  adjuntar_archivo: boolean;
  id_archivo?: number | null;
  nombre_archivo?: string | null;
}

export interface NotificacionAsignacionRespuesta {
  id_expediente: number;
  mensaje: string;
  fecha_notificacion_asignacion?: string | null;
  destinatarios_enviados?: number;
}

export interface AlertaCompromiso {
  id_expediente: number;
  num_expediente: string;
  tipo: 'TICKET' | 'WOOS';
  numero: string;
  fecha_compromiso: string;
  dias_vencido: number;
}

export interface FolioEntregable {
  id: number;
  id_expediente: number;
  tipo: 'DICTAMEN' | 'REPORTE';
  folio: string;
  estado: 'ACTIVO' | 'CANCELADO';
  motivo_cancelacion?: string | null;
  usuario_creacion?: string | null;
  usuario_cancelacion?: string | null;
  fecha_creacion: string;
  fecha_cancelacion?: string | null;
}

export function compromisoVencido(item: ItemCompromiso, hoy = new Date()): boolean {
  if (item.cerrado || !item.fecha_compromiso) {
    return false;
  }
  const [anio, mes, dia] = item.fecha_compromiso.split('-').map(Number);
  const compromiso = new Date(anio, mes - 1, dia);
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return compromiso.getTime() < inicioHoy.getTime();
}

/** El back manda timestamptz como `2026-10-08 19:36:36.102306+00`; no todos los navegadores lo leen sin `T` ni minutos en la zona. */
function fechaServidorIso(valor: string | null | undefined): string | null {
  const texto = valor?.trim();
  if (!texto) {
    return null;
  }
  return texto.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00');
}

@Injectable({ providedIn: 'root' })
export class SeguimientoAsignacionService {
  constructor(private http: HttpClient) {}

  obtenerSeguimiento(idExpediente: number): Observable<SeguimientoAcciones | null> {
    return this.http
      .get<{ data: SeguimientoAcciones | null }>(`${BASE_URL}/seguimiento/${idExpediente}`, { withCredentials: true })
      .pipe(map((r) => r.data));
  }

  guardarSeguimiento(
    datos: SeguimientoAcciones
  ): Observable<{ id_expediente: number; mensaje: string; folio: FolioEntregable | null }> {
    return this.http.put<{ id_expediente: number; mensaje: string; folio: FolioEntregable | null }>(
      `${BASE_URL}/seguimiento`,
      datos,
      { withCredentials: true }
    );
  }

  obtenerFolios(idExpediente: number): Observable<FolioEntregable[]> {
    return this.http
      .get<{ data: FolioEntregable[] }>(`${BASE_URL}/folios/expediente/${idExpediente}`, { withCredentials: true })
      .pipe(map((r) => r.data ?? []));
  }

  actualizarEstatus(idExpediente: number, status: number): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(
      `${BASE_URL}/estatus`,
      { id_expediente: idExpediente, status },
      { withCredentials: true }
    );
  }

  obtenerEspecialistas(incluirInactivos = false): Observable<Especialista[]> {
    return this.http
      .get<{ data: Especialista[] }>(`${BASE_URL}/especialistas`, {
        params: { incluir_inactivos: incluirInactivos },
        withCredentials: true,
      })
      .pipe(map((r) => r.data ?? []));
  }

  crearEspecialista(datos: EspecialistaPayload): Observable<Especialista> {
    return this.http
      .post<{ data: Especialista }>(`${BASE_URL}/especialistas`, datos, { withCredentials: true })
      .pipe(map((r) => r.data));
  }

  actualizarEspecialista(id: number, datos: EspecialistaPayload): Observable<Especialista> {
    return this.http
      .put<{ data: Especialista }>(`${BASE_URL}/especialistas/${id}`, datos, { withCredentials: true })
      .pipe(map((r) => r.data));
  }

  obtenerResumen(): Observable<ResumenSeguimiento[]> {
    return this.http
      .get<{ data: ResumenSeguimiento[] }>(`${BASE_URL}/resumen`, { withCredentials: true })
      .pipe(
        map((r) =>
          (r.data ?? []).map((fila) => ({
            ...fila,
            fecha_notificacion_asignacion: fechaServidorIso(fila.fecha_notificacion_asignacion),
          }))
        ),
        catchError(() => of([]))
      );
  }

  notificarAsignacion(datos: NotificacionAsignacionPayload): Observable<NotificacionAsignacionRespuesta> {
    return this.http.post<NotificacionAsignacionRespuesta>(`${BASE_URL}/notificar_asignacion`, datos, {
      withCredentials: true,
    });
  }

  obtenerAlertas(): Observable<AlertaCompromiso[]> {
    return this.http
      .get<{ data: AlertaCompromiso[] }>(`${BASE_URL}/alertas`, { withCredentials: true })
      .pipe(
        map((r) => r.data ?? []),
        catchError(() => of([]))
      );
  }
}
