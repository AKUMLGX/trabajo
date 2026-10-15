import { Component, Input, signal } from '@angular/core';

import { DashboardExportService } from '../../services/dashboard-export.service';
import { DashboardPanelFacade } from '../../services/dashboard-panel.facade';
import { PanelDatos } from '../../services/dashboard-panel.utils';

type EstadoDescarga = { tipo: 'ok' | 'error'; texto: string } | null;
type FormatoReporte = 'excel' | 'pdf' | 'pptx';

const ETIQUETAS_FORMATO: Record<FormatoReporte, string> = {
  excel: 'Excel del periodo',
  pdf: 'PDF de gráficas',
  pptx: 'Presentación',
};

@Component({
  selector: 'app-dashboard-reportes-bar',
  templateUrl: './dashboard-reportes-bar.component.html',
  styleUrl: './dashboard-reportes-bar.component.css',
})
export class DashboardReportesBarComponent {
  @Input({ required: true }) panel!: PanelDatos;

  readonly generando = signal<FormatoReporte | null>(null);
  readonly mensaje = signal<EstadoDescarga>(null);

  constructor(
    private panelFacade: DashboardPanelFacade,
    private exportService: DashboardExportService
  ) {}

  async generar(formato: FormatoReporte): Promise<void> {
    if (this.generando()) return;
    this.generando.set(formato);
    this.mensaje.set(null);
    const nombre = this.panelFacade.nombreBase(this.panel);
    try {
      if (formato === 'excel') await this.exportService.exportarExcel(this.panel, nombre);
      if (formato === 'pdf') await this.exportService.exportarPdf(this.panel, nombre);
      if (formato === 'pptx') await this.exportService.exportarPresentacion(this.panel, nombre);
      this.mensaje.set({ tipo: 'ok', texto: `${ETIQUETAS_FORMATO[formato]} descargado.` });
    } catch (err) {
      console.error(`[Dashboard] Error al generar ${formato}`, err);
      this.mensaje.set({ tipo: 'error', texto: `No se pudo generar ${ETIQUETAS_FORMATO[formato].toLowerCase()}. Intenta de nuevo.` });
    } finally {
      this.generando.set(null);
    }
  }
}
