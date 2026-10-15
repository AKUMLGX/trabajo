import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { CatalogoReworkItem } from '../interfaces/expediente-rework.interface';
import { CatalogoResponsableResponse } from '../../interfaces/catalogos.interface';

const TLALCALLI_BASE = environment.baseUrl.endsWith('/')
  ? environment.baseUrl
  : `${environment.baseUrl}/`;

/** El back guarda un registro "SIN ESPECIFICAR" con id 0 como valor nulo; no es una opción seleccionable. */
export function sinRegistroNulo<T extends { id_exp: number }>(items: T[] | null | undefined): T[] {
  return (items ?? []).filter((i) => Number(i.id_exp) !== 0);
}

/**
 * Caché en memoria (singleton) para catálogos rework usados en modales de seguimiento.
 * Evita llamadas duplicadas a getCat/1,3,6 y responsables cuando el padre ya los cargó.
 */
@Injectable({ providedIn: 'root' })
export class CatalogoReworkCacheService {
  private readonly getCatCache = new Map<number, Observable<CatalogoReworkItem[]>>();
  private responsablesCache$?: Observable<CatalogoResponsableResponse[]>;

  constructor(private http: HttpClient) {}

  getCat(numero: number): Observable<CatalogoReworkItem[]> {
    const existente = this.getCatCache.get(numero);
    if (existente) {
      return existente;
    }

    const peticion$ = this.http
      .get<CatalogoReworkItem[]>(`${TLALCALLI_BASE}catalogo/getCat/${numero}`, {
        withCredentials: true,
      })
      .pipe(
        map(sinRegistroNulo),
        catchError(() => of([])),
        shareReplay(1)
      );

    this.getCatCache.set(numero, peticion$);
    return peticion$;
  }

  getResponsables(): Observable<CatalogoResponsableResponse[]> {
    if (!this.responsablesCache$) {
      this.responsablesCache$ = this.http
        .get<CatalogoResponsableResponse[]>(`${TLALCALLI_BASE}catalogo/responsables`, {
          withCredentials: true,
        })
        .pipe(
          catchError(() => of([])),
          shareReplay(1)
        );
    }

    return this.responsablesCache$;
  }

  /** Catálogos usados por obtenerDetalleCaptura y formulario de edición. */
  getCatalogosCaptura(): Observable<{
    servicios: CatalogoReworkItem[];
    prioridades: CatalogoReworkItem[];
    estatus: CatalogoReworkItem[];
    ubicaciones: CatalogoReworkItem[];
  }> {
    return forkJoin({
      servicios: this.getCat(1),
      prioridades: this.getCat(2),
      estatus: this.getCat(3),
      ubicaciones: this.getCat(6),
    });
  }

  /** Catálogos del formulario de edición (subset de captura + responsables). */
  getCatalogosEdicion(): Observable<{
    servicios: CatalogoReworkItem[];
    estatus: CatalogoReworkItem[];
    ubicaciones: CatalogoReworkItem[];
    responsables: CatalogoResponsableResponse[];
  }> {
    return forkJoin({
      servicios: this.getCat(1),
      estatus: this.getCat(3),
      ubicaciones: this.getCat(6),
      responsables: this.getResponsables(),
    });
  }
}
