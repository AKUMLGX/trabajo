import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { CatalogoReworkCacheService } from '../../capture/services/catalogo-rework-cache.service';
import { FamiliaEntregable, SubtipoEntregable, subtiposDesdeCatalogo } from '../utils/entregable-folio.utils';

const TLALCALLI_BASE = environment.baseUrl.endsWith('/') ? environment.baseUrl : `${environment.baseUrl}/`;

const CATALOGO_POR_FAMILIA: Record<FamiliaEntregable, number> = { DICTAMEN: 7, REPORTE: 8 };
const RUTA_POR_FAMILIA: Record<FamiliaEntregable, string> = { DICTAMEN: 'dictamen', REPORTE: 'reporte' };

/** Folios de dictamen y reporte: el consecutivo lo calcula el back a partir de lo ya registrado. */
@Injectable({ providedIn: 'root' })
export class FoliosEntregableService {
  constructor(
    private http: HttpClient,
    private catalogos: CatalogoReworkCacheService
  ) {}

  obtenerSubtipos(): Observable<{ dictamen: SubtipoEntregable[]; reporte: SubtipoEntregable[] }> {
    return forkJoin({
      dictamen: this.catalogos.getCat(CATALOGO_POR_FAMILIA.DICTAMEN),
      reporte: this.catalogos.getCat(CATALOGO_POR_FAMILIA.REPORTE),
    }).pipe(
      map(({ dictamen, reporte }) => ({
        dictamen: subtiposDesdeCatalogo(dictamen, 'DICTAMEN'),
        reporte: subtiposDesdeCatalogo(reporte, 'REPORTE'),
      }))
    );
  }

  siguienteFolio(subtipo: SubtipoEntregable): Observable<string> {
    if (!subtipo.idCatalogo) {
      return throwError(() => new Error(`El subtipo ${subtipo.codigo} no está en el catálogo del servidor.`));
    }
    return this.http
      .get<{ data: string }>(`${this.base(subtipo.familia)}/consecutivo/${subtipo.idCatalogo}`, { withCredentials: true })
      .pipe(map((r) => r.data));
  }

  registrarFolio(familia: FamiliaEntregable, idExpediente: number, folio: string): Observable<void> {
    return this.http
      .post(`${this.base(familia)}/inserta`, { id_expediente: idExpediente, folio }, { withCredentials: true })
      .pipe(map(() => undefined));
  }

  /** Pide el siguiente consecutivo y lo registra de inmediato para que nadie más lo tome. */
  asignarFolio(subtipo: SubtipoEntregable, idExpediente: number): Observable<string> {
    return this.siguienteFolio(subtipo).pipe(
      switchMap((folio) => this.registrarFolio(subtipo.familia, idExpediente, folio).pipe(map(() => folio)))
    );
  }

  /** Da de baja el folio; el número no se vuelve a usar. */
  cancelarFolio(familia: FamiliaEntregable, folio: string): Observable<void> {
    return this.http
      .delete(`${this.base(familia)}/consecutivo/elimina/${encodeURIComponent(folio)}`, { withCredentials: true })
      .pipe(map(() => undefined));
  }

  private base(familia: FamiliaEntregable): string {
    return `${TLALCALLI_BASE}${RUTA_POR_FAMILIA[familia]}`;
  }
}
