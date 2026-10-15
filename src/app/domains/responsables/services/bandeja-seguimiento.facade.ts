import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, forkJoin } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import { ExpedienteTlalcalli } from '../../capture/interfaces/expediente-tlalcalli.interface';
import { CatalogoReworkCacheService } from '../../capture/services/catalogo-rework-cache.service';
import { ExpedienteTlalcalliService } from '../../capture/services/expediente-tlalcalli.service';
import { EspecialistaSesion } from '../../interfaces/oauth2.interfaces';
import { PermissionsService } from '../../services/permissions.service';
import { estatusSeleccionables, etiquetaEstatus } from '../../shared/utils/catalogo-estatus.utils';
import { ResponsablesService } from './responsables.service';
import { AlertaCompromiso, ResumenSeguimiento, SeguimientoAsignacionService } from './seguimiento-asignacion.service';

export interface ContextoBandeja {
  puedeEditarSeguimiento: boolean;
  /** Rol especialista (003): solo ve los asuntos donde está asignado. */
  soloAsignados: boolean;
  especialista: EspecialistaSesion | null;
}

export interface OpcionFiltro {
  value: string;
  label: string;
}

export interface IndicadoresSeguimiento {
  resumen: Map<number, ResumenSeguimiento>;
  alertas: AlertaCompromiso[];
}

export interface SolicitudCargaBandeja {
  filtrosConsulta: Record<string, unknown>;
  contexto: ContextoBandeja;
  /** true = listado global; false = solo el responsable mapeado del JWT. */
  listadoGlobal: boolean;
}

export interface ListaBandeja {
  expedientes: ExpedienteTlalcalli[];
  /** Nombre a mostrar en el encabezado; vacío en el listado global. */
  responsable: string;
}

/** Datos de la bandeja de Seguimiento y Asignación, listos para la vista. */
@Injectable({ providedIn: 'root' })
export class BandejaSeguimientoFacade {
  private readonly permisos = inject(PermissionsService);
  private readonly catalogos = inject(CatalogoReworkCacheService);
  private readonly expedientes = inject(ExpedienteTlalcalliService);
  private readonly responsables = inject(ResponsablesService);
  private readonly seguimiento = inject(SeguimientoAsignacionService);
  obtenerContexto(): Observable<ContextoBandeja> {
    return combineLatest([this.permisos.getAcciones(), this.permisos.getEspecialistaSesion()]).pipe(
      take(1),
      map(([acciones, especialista]) => ({
        puedeEditarSeguimiento: acciones.editarSeguimiento,
        soloAsignados: !acciones.verTodosLosAsuntos,
        especialista,
      }))
    );
  }

  obtenerOpcionesEstatus(): Observable<OpcionFiltro[]> {
    return this.catalogos.getCat(3).pipe(
      map((items) => [
        { value: '', label: 'Todos' },
        ...estatusSeleccionables(items).map((i) => {
          const valor = i.descripcion.trim().toUpperCase() === 'PEDIENTE' ? 'PENDIENTE' : i.descripcion.trim().toUpperCase();
          return { value: valor, label: etiquetaEstatus(valor) };
        }),
      ])
    );
  }

  obtenerIndicadores(): Observable<IndicadoresSeguimiento> {
    return forkJoin({ filas: this.seguimiento.obtenerResumen(), alertas: this.seguimiento.obtenerAlertas() }).pipe(
      map(({ filas, alertas }) => ({ resumen: new Map(filas.map((f) => [f.id_expediente, f])), alertas }))
    );
  }

  cargarExpedientes({ filtrosConsulta, contexto, listadoGlobal }: SolicitudCargaBandeja): Observable<ListaBandeja> {
    if (contexto.soloAsignados) {
      // Rol 003: el back filtra `resumen` por RFC y grupo en cat_especialistas (fix/tables).
      return forkJoin({
        lista: this.expedientes.consultarExpedientes(filtrosConsulta),
        resumen: this.seguimiento.obtenerResumen(),
      }).pipe(
        map(({ lista, resumen }) => {
          const asignados = new Set(resumen.map((r) => r.id_expediente));
          const nombre = contexto.especialista?.nombre?.trim();
          return {
            expedientes: (lista || []).filter((e) => !!e.id_expediente && asignados.has(e.id_expediente)),
            responsable: nombre || 'Mis asuntos asignados',
          };
        })
      );
    }

    if (listadoGlobal) {
      return this.expedientes.consultarExpedientes(filtrosConsulta).pipe(map((lista) => ({ expedientes: lista || [], responsable: '' })));
    }

    return this.responsables.obtenerMisExpedientes({}).pipe(
      switchMap((respuesta) => {
        const responsable = respuesta.responsable || '';
        const filtros = responsable ? { ...filtrosConsulta, responsable } : filtrosConsulta;
        return this.expedientes.consultarExpedientes(filtros).pipe(map((lista) => ({ expedientes: lista || [], responsable })));
      })
    );
  }
}
