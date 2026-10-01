import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DashboardService } from '../../services/dashboard.service';
import { PanelDatos } from '../../services/dashboard-panel.utils';

@Component({
  selector: 'app-dashboard-bandeja-cards',
  imports: [RouterLink],
  templateUrl: './dashboard-bandeja-cards.component.html',
})
export class DashboardBandejaCardsComponent {
  @Input({ required: true }) panel!: PanelDatos;

  constructor(private dashboardService: DashboardService) {}

  etiquetaEstatus(estatus: string): string {
    return this.dashboardService.getLabelEstatus(estatus);
  }

  porcentaje(valor: number, total: number): number {
    return total > 0 ? Math.round((valor / total) * 100) : 0;
  }
}
