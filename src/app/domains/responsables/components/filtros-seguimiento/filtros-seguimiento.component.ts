import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { OpcionFiltro } from '../../services/bandeja-seguimiento.facade';

/** Búsqueda, filtro de estatus y alcance de la bandeja (todos / responsable / asignados al especialista). */
@Component({
  selector: 'app-filtros-seguimiento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatSlideToggleModule],
  template: `
    <section class="tl-card p-5 md:p-6">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div class="tl-search flex-1">
          <span class="icon-font tl-search-icon">search</span>
          <input type="text" [ngModel]="texto()" (ngModelChange)="texto.set($event)" (keyup.enter)="buscar.emit()"
            placeholder="Buscar por oficio, expediente o asunto..." class="tl-input pl-11" />
        </div>

        <select [ngModel]="estatus() ?? ''" (ngModelChange)="elegirEstatus($event)" class="tl-select lg:w-[230px]">
          @for (opcion of opcionesEstatus(); track opcion.value) {
            <option [value]="opcion.value">{{ opcion.label }}</option>
          }
        </select>

        <div class="flex gap-3">
          <button type="button" (click)="limpiar.emit()" class="tl-btn-secondary flex-1 lg:flex-none">Limpiar</button>
          <button type="button" (click)="buscar.emit()" class="tl-btn-primary flex-1 lg:flex-none">
            <span class="icon-font !text-[18px]">search</span>
            Buscar
          </button>
        </div>
      </div>

      <div class="mt-5 flex flex-col gap-5 border-t border-tlalcalli-light-base/70 pt-5 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div class="flex items-center gap-3">
            <span class="tl-section-icon">
              <span class="icon-font !text-[22px]">{{ soloAsignados() ? 'badge' : incluirTodos() ? 'groups' : 'person' }}</span>
            </span>
            <div>
              <span class="block font-noto-sans text-[11px] font-semibold uppercase tracking-wider text-tlalcalli-gray">
                {{ soloAsignados() ? 'Asuntos asignados a' : incluirTodos() ? 'Vista' : 'Responsable' }}
              </span>
              <span class="block font-noto-sans text-sm font-semibold text-tlalcalli-deep">{{ responsable() || 'Sin asignar' }}</span>
            </div>
          </div>

          @if (soloAsignados()) {
            <span class="tl-chip tl-chip-neutral">
              <span class="icon-font !text-[14px]">visibility</span>
              Solo consulta
            </span>
          } @else {
            <label class="flex cursor-pointer items-center gap-2 rounded-xl bg-tlalcalli-light-lavender px-3 py-2">
              <mat-slide-toggle color="primary" [checked]="incluirTodos()" (change)="incluirTodosChange.emit($event.checked)"></mat-slide-toggle>
              <span class="font-noto-sans text-sm text-tlalcalli-primary">Ver todos los expedientes</span>
            </label>
          }
        </div>

        <div class="rounded-xl border border-tlalcalli-light-base/70 px-6 py-2.5 text-center lg:min-w-[120px]">
          <span class="block font-noto-sans text-2xl font-bold leading-none text-tlalcalli-deep">{{ total() }}</span>
          <span class="mt-1.5 block font-noto-sans text-[11px] font-semibold uppercase tracking-wider text-tlalcalli-gray">Total</span>
        </div>
      </div>
    </section>
  `,
})
export class FiltrosSeguimientoComponent {
  readonly texto = model<string | undefined>('');
  readonly estatus = model<string | undefined>('');
  readonly opcionesEstatus = input<OpcionFiltro[]>([]);
  readonly soloAsignados = input(false);
  readonly incluirTodos = input(false);
  readonly responsable = input('');
  readonly total = input(0);

  readonly buscar = output<void>();
  readonly limpiar = output<void>();
  readonly incluirTodosChange = output<boolean>();

  elegirEstatus(valor: string): void {
    this.estatus.set(valor);
    this.buscar.emit();
  }
}
