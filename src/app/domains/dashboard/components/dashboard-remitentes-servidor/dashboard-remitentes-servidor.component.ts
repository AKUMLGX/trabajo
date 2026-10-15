import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { MetricaRemitente } from '../../services/metricas-panel.service';

interface ListaRemitentes {
  titulo: string;
  icono: string;
  items: MetricaRemitente[];
  maximo: number;
}

@Component({
  selector: 'app-dashboard-remitentes-servidor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-remitentes-servidor.component.html',
})
export class DashboardRemitentesServidorComponent {
  readonly porGeneral = input.required<MetricaRemitente[]>();
  readonly porCentral = input.required<MetricaRemitente[]>();

  readonly listas = computed<ListaRemitentes[]>(() =>
    [
      { titulo: 'Administración general', icono: 'account_balance', items: this.porGeneral() },
      { titulo: 'Administración central', icono: 'apartment', items: this.porCentral() },
    ].map((l) => ({ ...l, maximo: Math.max(1, ...l.items.map((i) => i.total)) }))
  );

  readonly hayDatos = computed(() => this.porGeneral().length > 0 || this.porCentral().length > 0);

  ancho(total: number, maximo: number): number {
    return Math.max(4, Math.round((total / maximo) * 100));
  }
}
