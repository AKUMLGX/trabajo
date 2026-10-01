import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ExpedienteTlalcalliService } from '../../capture/services/expediente-tlalcalli.service';
import { CierreReworkService } from '../../responsables/services/cierre-rework.service';
import { SeguimientoAsignacionService } from '../../responsables/services/seguimiento-asignacion.service';
import { DashboardService } from './dashboard.service';
import { PanelDatos, construirPanel, panelACsv } from './dashboard-panel.utils';

@Injectable({ providedIn: 'root' })
export class DashboardPanelFacade {
  constructor(
    private dashboardService: DashboardService,
    private expedienteService: ExpedienteTlalcalliService,
    private seguimientoService: SeguimientoAsignacionService,
    private cierreService: CierreReworkService
  ) {}

  /** Carga en paralelo las fuentes de las cuatro bandejas; una fuente caída no bloquea el panel. */
  cargarPanel(): Observable<PanelDatos> {
    return forkJoin({
      estadisticas: this.dashboardService.obtenerEstadisticas(),
      expedientes: this.expedienteService.consultarExpedientes({}).pipe(catchError(() => of([]))),
      resumenSeguimiento: this.seguimientoService.obtenerResumen().pipe(catchError(() => of([]))),
      alertas: this.seguimientoService.obtenerAlertas().pipe(catchError(() => of([]))),
      resumenCierre: this.cierreService.obtenerResumen().pipe(catchError(() => of([]))),
    }).pipe(map((fuentes) => construirPanel(fuentes)));
  }

  descargarExcelExpedientes(): Observable<Blob> {
    return this.expedienteService.descargarExcelExpedientes({});
  }

  descargarResumenCsv(panel: PanelDatos): void {
    const blob = new Blob([panelACsv(panel)], { type: 'text/csv;charset=utf-8' });
    this.descargarBlob(blob, `panel_estadistico_${this.fechaArchivo(panel.generado)}.csv`);
  }

  descargarBlob(blob: Blob, nombre: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  fechaArchivo(fecha = new Date()): string {
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }
}
