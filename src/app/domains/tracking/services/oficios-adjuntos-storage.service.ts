import { Injectable } from '@angular/core';

import { OficioAdjuntoExpediente } from '../interfaces/expediente-detalle-captura.interface';

const STORAGE_PREFIX = 'tlalcalli_oficios_adjuntos_';

@Injectable({ providedIn: 'root' })
export class OficiosAdjuntosStorageService {
  cargar(claveExpediente: string | number): OficioAdjuntoExpediente[] {
    if (claveExpediente == null || claveExpediente === '') {
      return [];
    }

    try {
      const raw = localStorage.getItem(this.clave(claveExpediente));
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as OficioAdjuntoExpediente[];
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map((item) => this.normalizarOficio(item));
    } catch {
      return [];
    }
  }

  /** Solo registros pendientes de API (POST no disponible o fallido). */
  cargarPendientesLocales(claveExpediente: string | number): OficioAdjuntoExpediente[] {
    return this.cargar(claveExpediente).filter((item) => item.pendiente_endpoint !== false);
  }

  guardar(claveExpediente: string | number, oficios: OficioAdjuntoExpediente[]): void {
    if (claveExpediente == null || claveExpediente === '') {
      return;
    }

    try {
      localStorage.setItem(this.clave(claveExpediente), JSON.stringify(oficios));
    } catch {
      // Ignorar cuota excedida u otros errores de almacenamiento
    }
  }

  eliminar(claveExpediente: string | number): void {
    if (claveExpediente == null || claveExpediente === '') {
      return;
    }

    localStorage.removeItem(this.clave(claveExpediente));
  }

  private clave(claveExpediente: string | number): string {
    return `${STORAGE_PREFIX}${String(claveExpediente).trim()}`;
  }

  private normalizarOficio(
    item: OficioAdjuntoExpediente & {
      /** Legacy localStorage / API anterior */
      descripcion?: string;
      asunto_referencia?: string;
    }
  ): OficioAdjuntoExpediente {
    const asunto =
      item.asunto?.trim() ||
      item.descripcion?.trim() ||
      item.asunto_referencia?.trim() ||
      undefined;

    return {
      id: item.id,
      id_archivo: item.id_archivo,
      localId: item.localId,
      num_oficio: item.num_oficio,
      fecha_documento: item.fecha_documento,
      fecha_recepcion: item.fecha_recepcion,
      fecha_vencimiento: item.fecha_vencimiento,
      asunto,
      nombre_archivo: item.nombre_archivo,
      fecha_registro: item.fecha_registro,
      pendiente_endpoint: item.pendiente_endpoint,
    };
  }
}
