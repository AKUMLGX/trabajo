import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

const TLALCALLI_BASE = environment.baseUrl.endsWith('/') ? environment.baseUrl : `${environment.baseUrl}/`;

/** Respuesta tal como la entrega `GET metricas`. */
interface MetricasRespuesta {
  generales?: { cantidad: number; descripcion: string; porcentaje: number }[];
  vencidos?: { vencidos: number; promedio: number }[];
  expedientes_criticos?: {
    num_expediente: string;
    num_oficio: string;
    responsable: string;
    status: string;
    horas_transcurridas: number;
  }[];
  por_responsable?: { responsable: string; total: number; pendientes: number; atendidos: number }[];
  por_prioridad?: { prioridad: string; total: number }[];
  por_general?: { general: string; total: number }[];
  por_central?: { central: string; total: number }[];
}

export interface MetricaRemitente {
  clave: string;
  total: number;
}

export interface MetricaEstatus {
  estatus: string;
  cantidad: number;
}

export interface ExpedienteCriticoServidor {
  expediente: string;
  oficio: string;
  responsable: string;
  estatus: string;
  horas: number;
}

export interface MetricaResponsable {
  responsable: string;
  total: number;
  pendientes: number;
  atendidos: number;
  otros: number;
}

export interface MetricaPrioridad {
  /** Texto antes del paréntesis del catálogo, p. ej. "Extra urgente". */
  prioridad: string;
  descripcion: string;
  total: number;
}

/** Indicadores de todo el universo calculados en el back (no dependen del periodo). */
export interface MetricasServidor {
  porEstatus: MetricaEstatus[];
  totalUniverso: number;
  /** null cuando la consulta del back falló (p. ej. fechas `YYYY-MM-DD` en fecha_recepcion). */
  vencidos: { vencidos: number; promedioHoras: number } | null;
  criticos: ExpedienteCriticoServidor[];
  porResponsable: MetricaResponsable[];
  porPrioridad: MetricaPrioridad[];
  /** Solo administraciones con al menos un expediente, de mayor a menor. */
  porGeneral: MetricaRemitente[];
  porCentral: MetricaRemitente[];
}

function remitentesConExpedientes(lista: { clave: string; total: number }[]): MetricaRemitente[] {
  return lista
    .map((r) => ({ clave: (r.clave || '').trim(), total: Number(r.total) || 0 }))
    .filter((r) => r.clave && r.total > 0)
    .sort((a, b) => b.total - a.total || a.clave.localeCompare(b.clave));
}

/** El catálogo trae la variante PEDIENTE; en el panel se muestra PENDIENTE. */
function normalizarEstatus(valor: string | null | undefined): string {
  const s = (valor || '').trim().toUpperCase();
  return s === 'PEDIENTE' ? 'PENDIENTE' : s || 'SIN ESTATUS';
}

export function normalizarMetricas(r: MetricasRespuesta): MetricasServidor {
  const porEstatus = (r.generales ?? [])
    .map((g) => ({ estatus: normalizarEstatus(g.descripcion), cantidad: g.cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);
  const vencidos = r.vencidos?.[0];
  return {
    porEstatus,
    totalUniverso: porEstatus.reduce((acc, e) => acc + e.cantidad, 0),
    vencidos: vencidos ? { vencidos: vencidos.vencidos, promedioHoras: vencidos.promedio } : null,
    criticos: (r.expedientes_criticos ?? [])
      .map((c) => ({
        expediente: c.num_expediente,
        oficio: c.num_oficio || '',
        responsable: c.responsable || 'Sin responsable',
        estatus: normalizarEstatus(c.status),
        horas: c.horas_transcurridas,
      }))
      .sort((a, b) => b.horas - a.horas),
    porResponsable: (r.por_responsable ?? [])
      .map((p) => ({
        responsable: (p.responsable || '').trim() || 'Sin responsable',
        total: p.total,
        pendientes: p.pendientes,
        atendidos: p.atendidos,
        otros: Math.max(0, p.total - p.pendientes - p.atendidos),
      }))
      .sort((a, b) => b.total - a.total),
    porPrioridad: (r.por_prioridad ?? [])
      .map((p) => ({
        prioridad: p.prioridad.split('(')[0].trim() || p.prioridad,
        descripcion: p.prioridad,
        total: p.total,
      }))
      .sort((a, b) => b.total - a.total),
    porGeneral: remitentesConExpedientes((r.por_general ?? []).map((g) => ({ clave: g.general, total: g.total }))),
    porCentral: remitentesConExpedientes((r.por_central ?? []).map((c) => ({ clave: c.central, total: c.total }))),
  };
}

@Injectable({ providedIn: 'root' })
export class MetricasPanelService {
  constructor(private http: HttpClient) {}

  /** null si el back no expone el endpoint o falla; el panel sigue con lo calculado en el front. */
  obtener(): Observable<MetricasServidor | null> {
    return this.http.get<MetricasRespuesta>(`${TLALCALLI_BASE}metricas`, { withCredentials: true }).pipe(
      map(normalizarMetricas),
      catchError(() => of(null))
    );
  }

  /** `GET metricas/excel` (Max `077edff+`): xlsx del servidor o JSON si no hay críticos. */
  descargarCriticosExcelServidor(): Observable<DescargaCriticosExcel> {
    return this.http
      .get(`${TLALCALLI_BASE}metricas/excel`, {
        withCredentials: true,
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        mergeMap((res) => from(this.interpretarExcelCriticos(res))),
        catchError(() => of({ tipo: 'no_disponible' as const }))
      );
  }

  private async interpretarExcelCriticos(res: HttpResponse<Blob>): Promise<DescargaCriticosExcel> {
    const blob = res.body;
    if (!blob || blob.size === 0) {
      return { tipo: 'no_disponible' };
    }
    const tipo = (res.headers.get('Content-Type') ?? '').toLowerCase();
    if (tipo.includes('json') || tipo.includes('text/plain')) {
      const texto = await blob.text();
      try {
        const json = JSON.parse(texto) as { data?: string; mensaje?: string };
        return { tipo: 'sin_datos', mensaje: json.data ?? json.mensaje ?? texto };
      } catch {
        return { tipo: 'sin_datos', mensaje: texto };
      }
    }
    const cabecera = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
    const esZip = cabecera[0] === 0x50 && cabecera[1] === 0x4b;
    if (!esZip && !tipo.includes('excel') && !tipo.includes('spreadsheet')) {
      return { tipo: 'no_disponible' };
    }
    return {
      tipo: 'archivo',
      blob: new Blob([blob], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    };
  }
}

export type DescargaCriticosExcel =
  | { tipo: 'archivo'; blob: Blob }
  | { tipo: 'sin_datos'; mensaje: string }
  | { tipo: 'no_disponible' };
