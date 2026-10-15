import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AlertaCompromiso } from '../../services/seguimiento-asignacion.service';

/** Aviso de tickets / WOOS con fecha compromiso vencida; «Abrir» emite el id del expediente. */
@Component({
  selector: 'app-alertas-compromiso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    @if (alertas().length > 0) {
      <section class="tl-card overflow-hidden border-l-4 border-l-tlalcalli-error bg-tlalcalli-error/[0.04] px-5 py-4 md:px-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="tl-stat-icon bg-tlalcalli-error/10 text-tlalcalli-error-muted">
              <span class="icon-font !text-[22px]">notification_important</span>
            </span>
            <div>
              <span class="block font-noto-sans text-sm font-semibold text-tlalcalli-error-muted">
                {{ alertas().length }} compromiso(s) de cierre vencido(s) en tickets / WOOS
              </span>
              <span class="block font-noto-sans text-xs text-tlalcalli-gray">Sujetos a penalización por incumplimiento de la fecha compromiso.</span>
            </div>
          </div>
          <button type="button" (click)="mostrarDetalle.set(!mostrarDetalle())" class="tl-btn-secondary tl-btn-sm">
            <span class="icon-font !text-[16px]">{{ mostrarDetalle() ? 'expand_less' : 'expand_more' }}</span>
            {{ mostrarDetalle() ? 'Ocultar detalle' : 'Ver detalle' }}
          </button>
        </div>
        @if (mostrarDetalle()) {
          <ul class="m-0 mt-4 list-none divide-y divide-tlalcalli-light-base/70 rounded-xl bg-white p-0 px-4">
            @for (alerta of alertas(); track alerta.id_expediente + alerta.tipo + alerta.numero) {
              <li class="flex flex-wrap items-center justify-between gap-2 py-2.5 font-noto-sans text-xs text-tlalcalli-dark">
                <span>
                  <strong class="text-tlalcalli-deep">{{ alerta.num_expediente }}</strong>
                  · {{ alerta.tipo === 'TICKET' ? 'Ticket' : 'WOOS' }} {{ alerta.numero }}
                  · compromiso {{ alerta.fecha_compromiso | date: 'dd/MM/yyyy' }}
                </span>
                <span class="flex items-center gap-3">
                  <span class="tl-chip tl-chip-error">{{ alerta.dias_vencido }} día(s) vencido</span>
                  <button type="button" (click)="abrir.emit(alerta.id_expediente)" class="tl-btn-secondary tl-btn-sm">Abrir</button>
                </span>
              </li>
            }
          </ul>
        }
      </section>
    }
  `,
})
export class AlertasCompromisoComponent {
  readonly alertas = input<AlertaCompromiso[]>([]);
  readonly abrir = output<number>();

  readonly mostrarDetalle = signal(false);
}
