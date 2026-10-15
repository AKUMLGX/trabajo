import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  RangoFechas,
  etiquetaRango,
  fechaIso,
  rangoAnioActual,
  rangoHoy,
} from '../../services/dashboard-panel.utils';

type Preset = 'HOY' | 'SEMANA' | 'MES' | 'ANIO' | 'PERSONALIZADO';

@Component({
  selector: 'app-dashboard-filtro-periodo',
  imports: [FormsModule],
  templateUrl: './dashboard-filtro-periodo.component.html',
})
export class DashboardFiltroPeriodoComponent implements OnChanges {
  @Input({ required: true }) rango!: RangoFechas;
  @Input() capturadas = 0;
  @Input() sinFechaDocumento = 0;
  @Output() rangoChange = new EventEmitter<RangoFechas>();

  readonly presets: { id: Preset; etiqueta: string }[] = [
    { id: 'HOY', etiqueta: 'Hoy' },
    { id: 'SEMANA', etiqueta: 'Últimos 7 días' },
    { id: 'MES', etiqueta: 'Mes actual' },
    { id: 'ANIO', etiqueta: 'Año actual' },
    { id: 'PERSONALIZADO', etiqueta: 'Personalizado' },
  ];

  preset: Preset = 'HOY';
  desde = '';
  hasta = '';

  ngOnChanges(): void {
    this.desde = this.rango.desde;
    this.hasta = this.rango.hasta;
    this.preset = this.presetDe(this.rango);
  }

  get etiqueta(): string {
    return etiquetaRango(this.rango);
  }

  get rangoInvalido(): boolean {
    return !this.desde || !this.hasta || this.desde > this.hasta;
  }

  elegirPreset(id: Preset): void {
    this.preset = id;
    if (id === 'PERSONALIZADO') {
      return;
    }
    this.rangoChange.emit(this.rangoDePreset(id));
  }

  aplicarPersonalizado(): void {
    if (this.rangoInvalido) {
      return;
    }
    this.rangoChange.emit({ desde: this.desde, hasta: this.hasta });
  }

  private rangoDePreset(id: Exclude<Preset, 'PERSONALIZADO'>, ahora = new Date()): RangoFechas {
    if (id === 'SEMANA') {
      const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - 6);
      return { desde: fechaIso(inicio), hasta: fechaIso(ahora) };
    }
    if (id === 'MES') {
      return { desde: fechaIso(new Date(ahora.getFullYear(), ahora.getMonth(), 1)), hasta: fechaIso(ahora) };
    }
    if (id === 'ANIO') {
      return rangoAnioActual(ahora);
    }
    return rangoHoy(ahora);
  }

  private presetDe(rango: RangoFechas): Preset {
    for (const id of ['HOY', 'SEMANA', 'MES', 'ANIO'] as const) {
      const r = this.rangoDePreset(id);
      if (r.desde === rango.desde && r.hasta === rango.hasta) {
        return id;
      }
    }
    return 'PERSONALIZADO';
  }
}
