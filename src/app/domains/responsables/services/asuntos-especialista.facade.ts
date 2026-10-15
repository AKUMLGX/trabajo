import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, filter, map, mergeMap, toArray } from 'rxjs/operators';

import { ExpedienteTlalcalli } from '../../capture/interfaces/expediente-tlalcalli.interface';
import { EspecialistaSesion } from '../../interfaces/oauth2.interfaces';
import { estaAsignado } from '../utils/asignacion-especialista.utils';
import { SeguimientoAsignacionService } from './seguimiento-asignacion.service';

const CONSULTAS_SIMULTANEAS = 6;

/**
 * Asuntos visibles para el rol especialista (003) en el login de prueba local, donde el especialista
 * se elige en pantalla. Con token real el filtro lo hace el back por RFC en `resumen`.
 */
@Injectable({ providedIn: 'root' })
export class AsuntosEspecialistaFacade {
  private readonly seguimiento = inject(SeguimientoAsignacionService);

  filtrarAsignados(expedientes: ExpedienteTlalcalli[], especialista: EspecialistaSesion | null): Observable<ExpedienteTlalcalli[]> {
    if (!especialista || especialista.ids.length === 0) return of([]);
    const conId = expedientes.filter((e) => !!e.id_expediente);
    if (conId.length === 0) return of([]);

    return from(conId).pipe(
      mergeMap(
        (expediente) =>
          this.seguimiento.obtenerSeguimiento(expediente.id_expediente!).pipe(
            map((seg) => (estaAsignado(seg?.asignaciones, especialista) ? expediente : null)),
            catchError(() => of(null)),
          ),
        CONSULTAS_SIMULTANEAS,
      ),
      filter((e): e is ExpedienteTlalcalli => e !== null),
      toArray(),
      map((asignados) => {
        const ids = new Set(asignados.map((e) => e.id_expediente));
        return conId.filter((e) => ids.has(e.id_expediente));
      }),
    );
  }
}
