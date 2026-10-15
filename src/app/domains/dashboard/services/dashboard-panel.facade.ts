import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ApiService } from '../../capture/services/api.service';
import { CatalogoReworkCacheService } from '../../capture/services/catalogo-rework-cache.service';
import { ExpedienteTlalcalliService } from '../../capture/services/expediente-tlalcalli.service';
import {
  CatalogoGeneralResponse,
  CatalogoGeneralesCentralResponse,
} from '../../interfaces/first-step-catalogos.interface';
import {
  CatalogoRemitenteAdmin,
  construirCatalogoRemitenteAdmin,
  enriquecerExpedientesRemitenteAdmin,
} from './dashboard-remitente-admin.utils';
import { FuentesPanel, PanelDatos, RangoFechas, construirPanel } from './dashboard-panel.utils';
import { MetricasPanelService } from './metricas-panel.service';

@Injectable({ providedIn: 'root' })
export class DashboardPanelFacade {
  private catalogoRemitente: CatalogoRemitenteAdmin | null = null;

  constructor(
    private expedienteService: ExpedienteTlalcalliService,
    private apiService: ApiService,
    private catalogoReworkCache: CatalogoReworkCacheService,
    private metricasService: MetricasPanelService
  ) {}

  /** Catálogo usado para etiquetas de administración general/central en el panel. */
  getCatalogoRemitente(): CatalogoRemitenteAdmin | null {
    return this.catalogoRemitente;
  }

  /** El catálogo y las métricas del servidor son opcionales; si falla el listado, el panel muestra el error en vez de ceros. */
  cargarFuentes(): Observable<FuentesPanel> {
    return forkJoin({
      expedientes: this.expedienteService.consultarExpedientes({}),
      catalogoRemitente: this.cargarCatalogoRemitente().pipe(catchError(() => of(null))),
      servicios: this.catalogoReworkCache.getCat(1),
      metricas: this.metricasService.obtener(),
    }).pipe(
      map(({ expedientes, catalogoRemitente, servicios, metricas }) => {
        this.catalogoRemitente = catalogoRemitente;
        return {
          expedientes: enriquecerExpedientesRemitenteAdmin(expedientes, catalogoRemitente),
          serviciosCatalogo: servicios.filter((s) => !s.eliminado).map((s) => s.descripcion),
          metricas,
        };
      })
    );
  }

  cargarPanel(rango?: RangoFechas): Observable<PanelDatos> {
    return this.cargarFuentes().pipe(
      map((fuentes) => construirPanel(fuentes, new Date(), rango, this.catalogoRemitente))
    );
  }

  /** Prefijo de archivo con el periodo consultado, p. ej. panel_estadistico_2026-10-01_al_2026-10-07. */
  nombreBase(panel: PanelDatos): string {
    const { desde, hasta } = panel.periodo.rango;
    return desde === hasta ? `panel_estadistico_${desde}` : `panel_estadistico_${desde}_al_${hasta}`;
  }

  private cargarCatalogoRemitente(): Observable<CatalogoRemitenteAdmin | null> {
    return forkJoin({
      generales: this.apiService.getData<CatalogoGeneralResponse[]>('catalogo/generales', true).pipe(
        map((r) => r.body ?? []),
        catchError(() => of([] as CatalogoGeneralResponse[]))
      ),
      generalesXCentral: this.apiService
        .getData<CatalogoGeneralesCentralResponse>('catalogo/generales_x_central', true)
        .pipe(
          map((r) => r.body ?? {}),
          catchError(() => of({} as CatalogoGeneralesCentralResponse))
        ),
    }).pipe(
      map(({ generales, generalesXCentral }) => construirCatalogoRemitenteAdmin(generales, generalesXCentral))
    );
  }
}
