import { Component, Input, OnChanges, inject } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PanelSinAtender } from '../../services/dashboard-panel.utils';
import { DashboardExportService } from '../../services/dashboard-export.service';
import { TablaPaginadorComponent } from '../../../shared/components/tabla-paginador/tabla-paginador.component';
import { EtiquetaEstatusPipe } from '../../../shared/pipes/etiqueta-estatus.pipe';

@Component({
  selector: 'app-dashboard-sin-atender',
  imports: [EtiquetaEstatusPipe, RouterLink, DatePipe, NgClass, MatTooltipModule, TablaPaginadorComponent],
  templateUrl: './dashboard-sin-atender.component.html',
})
export class DashboardSinAtenderComponent implements OnChanges {
  @Input({ required: true }) sinAtender!: PanelSinAtender;

  readonly tamanoPagina = 10;
  pagina = 1;
  descargando = false;

  private readonly exportService = inject(DashboardExportService);

  ngOnChanges(): void {
    this.pagina = 1;
  }

  get filas() {
    const inicio = (this.pagina - 1) * this.tamanoPagina;
    return this.sinAtender.items.slice(inicio, inicio + this.tamanoPagina);
  }

  async descargarExcel(): Promise<void> {
    if (this.descargando) return;
    this.descargando = true;
    try {
      const hoy = new Date();
      const fecha = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}${String(hoy.getDate()).padStart(2, '0')}`;
      await this.exportService.exportarSinAtenderExcel(this.sinAtender, `asuntos_sin_atender_${fecha}`);
    } finally {
      this.descargando = false;
    }
  }

  /** Más de 6 meses se marca como el caso más grave. */
  esExtremo(dias: number): boolean {
    return dias >= this.sinAtender.umbralDias * 2;
  }
}
