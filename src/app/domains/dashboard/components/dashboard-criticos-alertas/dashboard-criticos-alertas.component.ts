import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DashboardService } from '../../services/dashboard.service';
import { LIMITE_HORAS_SEMAFORO, PanelDatos, formatearDuracion } from '../../services/dashboard-panel.utils';

@Component({
  selector: 'app-dashboard-criticos-alertas',
  imports: [RouterLink],
  templateUrl: './dashboard-criticos-alertas.component.html',
})
export class DashboardCriticosAlertasComponent {
  @Input({ required: true }) panel!: PanelDatos;

  readonly maxFilas = 10;

  constructor(private dashboardService: DashboardService) {}

  esVencido(horas: number): boolean {
    return horas >= LIMITE_HORAS_SEMAFORO;
  }

  tiempo(horas: number): string {
    return formatearDuracion(horas);
  }

  etiquetaEstatus(estatus: string): string {
    return this.dashboardService.getLabelEstatus(estatus);
  }
}
