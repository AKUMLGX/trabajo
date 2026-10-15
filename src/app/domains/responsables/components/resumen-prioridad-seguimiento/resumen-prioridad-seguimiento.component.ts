import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { NivelPrioridadAsunto } from '../../../capture/utils/prioridad-asunto.utils';
import { ConteoSemaforo } from '../../utils/bandeja-seguimiento.utils';

interface TarjetaPrioridad {
  nivel: NivelPrioridadAsunto;
  clave: keyof ConteoSemaforo;
  etiqueta: string;
  icono: string;
  anillo: string;
  acento: string;
  iconoClase: string;
  valorClase: string;
  avance: string;
}

const TARJETAS: TarjetaPrioridad[] = [
  {
    nivel: 'EN_TIEMPO', clave: 'en_tiempo', etiqueta: 'En tiempo', icono: 'schedule',
    anillo: 'ring-2 ring-tlalcalli-success', acento: 'bg-tlalcalli-success',
    iconoClase: 'bg-tlalcalli-success/10 text-tlalcalli-success-muted', valorClase: 'text-tlalcalli-success-muted', avance: 'w-1/3',
  },
  {
    nivel: 'URGENTE', clave: 'urgente', etiqueta: 'Urgente', icono: 'warning',
    anillo: 'ring-2 ring-tlalcalli-warning', acento: 'bg-tlalcalli-warning',
    iconoClase: 'bg-tlalcalli-warning/10 text-tlalcalli-warning-muted', valorClase: 'text-tlalcalli-warning-muted', avance: 'w-2/3',
  },
  {
    nivel: 'EXTRA_URGENTE', clave: 'extra_urgente', etiqueta: 'Extra urgente', icono: 'priority_high',
    anillo: 'ring-2 ring-tlalcalli-error', acento: 'bg-tlalcalli-error',
    iconoClase: 'bg-tlalcalli-error/10 text-tlalcalli-error-muted', valorClase: 'text-tlalcalli-error-muted', avance: 'w-[90%]',
  },
  {
    nivel: 'VENCIDO', clave: 'vencido', etiqueta: 'Vencido', icono: 'event_busy',
    anillo: 'ring-2 ring-tlalcalli-dark', acento: 'bg-tlalcalli-dark',
    iconoClase: 'bg-tlalcalli-dark/10 text-tlalcalli-dark', valorClase: 'text-tlalcalli-dark', avance: 'w-full',
  },
];

/** Tarjetas de semáforo de la bandeja; al elegir una se filtra por ese nivel. */
@Component({
  selector: 'app-resumen-prioridad-seguimiento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="tl-card p-5 md:p-6">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div class="tl-section-title">
          <span class="tl-section-icon"><span class="icon-font !text-[22px]">layers</span></span>
          <div>
            <h2 class="tl-section-heading">Prioridad de asuntos</h2>
            <p class="tl-section-subtitle">Prioridad y vencimiento definidos al capturar el requerimiento</p>
          </div>
        </div>
        @if (filtro()) {
          <button type="button" (click)="filtroChange.emit('')" class="tl-btn-secondary tl-btn-sm">
            <span class="icon-font !text-[16px]">filter_alt_off</span>
            Quitar filtro
          </button>
        }
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        @for (t of tarjetas; track t.nivel) {
          <button type="button" class="tl-stat tl-stat-clickable items-start" [class]="filtro() === t.nivel ? t.anillo : ''"
            (click)="filtroChange.emit(t.nivel)">
            <span class="tl-stat-accent" [class]="t.acento"></span>
            <div class="flex w-full flex-col items-start gap-3">
              <div class="flex items-center gap-3">
                <span class="tl-stat-icon shrink-0" [class]="t.iconoClase"><span class="icon-font !text-[22px]">{{ t.icono }}</span></span>
                <span class="tl-stat-label">{{ t.etiqueta }}</span>
              </div>
              <span class="tl-stat-value tabular-nums leading-none" [class]="t.valorClase">{{ conteo()[t.clave] }}</span>
              <div class="tl-progress w-full"><div class="h-full rounded-full" [class]="t.avance + ' ' + t.acento"></div></div>
            </div>
          </button>
        }
      </div>
    </section>
  `,
})
export class ResumenPrioridadSeguimientoComponent {
  readonly conteo = input.required<ConteoSemaforo>();
  readonly filtro = input('');
  readonly filtroChange = output<string>();

  readonly tarjetas = TARJETAS;
}
