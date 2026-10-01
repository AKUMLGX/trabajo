import { Component, Input, signal } from '@angular/core';

import { DashboardPanelFacade } from '../../services/dashboard-panel.facade';
import { PanelDatos } from '../../services/dashboard-panel.utils';

type EstadoDescarga = { tipo: 'ok' | 'error'; texto: string } | null;

@Component({
  selector: 'app-dashboard-reportes-bar',
  templateUrl: './dashboard-reportes-bar.component.html',
})
export class DashboardReportesBarComponent {
  @Input({ required: true }) panel!: PanelDatos;
  @Input() puedeExportar = false;

  readonly descargandoExcel = signal(false);
  readonly mensaje = signal<EstadoDescarga>(null);

  constructor(private panelFacade: DashboardPanelFacade) {}

  descargarExcel(): void {
    this.descargandoExcel.set(true);
    this.mensaje.set(null);
    this.panelFacade.descargarExcelExpedientes().subscribe({
      next: (blob) => {
        this.panelFacade.descargarBlob(blob, `expedientes_tlalcalli_${this.panelFacade.fechaArchivo()}.xlsx`);
        this.descargandoExcel.set(false);
        this.mensaje.set({ tipo: 'ok', texto: 'Reporte de expedientes descargado.' });
      },
      error: () => {
        this.descargandoExcel.set(false);
        this.mensaje.set({ tipo: 'error', texto: 'No se pudo generar el Excel de expedientes. Intenta de nuevo.' });
      },
    });
  }

  descargarResumen(): void {
    this.panelFacade.descargarResumenCsv(this.panel);
    this.mensaje.set({ tipo: 'ok', texto: 'Resumen del panel descargado.' });
  }
}
