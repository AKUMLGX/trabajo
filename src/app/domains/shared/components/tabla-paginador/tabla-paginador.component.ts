import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

import { paginaValida, totalPaginas } from '../../utils/paginacion.utils';

/**
 * Pie de tabla con «Mostrando X a Y de Z» y navegación.
 * Sin `opcionesTamano` solo aparece cuando hay más de una página; con opciones queda siempre visible.
 */
@Component({
  selector: 'app-tabla-paginador',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div class="flex flex-col gap-3 border-t border-tlalcalli-light-base/70 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap items-center gap-4">
          <p class="m-0 font-noto-sans text-xs text-tlalcalli-gray">
            Mostrando <strong class="text-tlalcalli-deep">{{ desde() }}</strong> a
            <strong class="text-tlalcalli-deep">{{ hasta() }}</strong> de
            <strong class="text-tlalcalli-deep">{{ total() }}</strong>
          </p>
          @if (opcionesTamano().length) {
            <label class="flex items-center gap-2 font-noto-sans text-xs text-tlalcalli-gray">
              Filas por página
              <select class="tl-select h-8 w-[76px] py-0 text-xs" [value]="tamano()" (change)="cambiarTamano($event)">
                @for (opcion of opcionesTamano(); track opcion) {
                  <option [value]="opcion" [selected]="opcion === tamano()">{{ opcion }}</option>
                }
              </select>
            </label>
          }
        </div>
        <div class="flex items-center gap-2">
          <button type="button" class="tl-btn-secondary tl-btn-sm" [disabled]="paginaActual() <= 1" (click)="ir(paginaActual() - 1)">
            <span class="icon-font !text-[16px]">chevron_left</span>
            Anterior
          </button>
          <span class="font-noto-sans text-xs text-tlalcalli-gray">Página {{ paginaActual() }} de {{ paginas() }}</span>
          <button type="button" class="tl-btn-secondary tl-btn-sm" [disabled]="paginaActual() >= paginas()" (click)="ir(paginaActual() + 1)">
            Siguiente
            <span class="icon-font !text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>
    }
  `,
})
export class TablaPaginadorComponent {
  readonly total = input.required<number>();
  readonly pagina = model(1);
  readonly tamano = model(10);
  readonly opcionesTamano = input<number[]>([]);

  readonly paginas = computed(() => totalPaginas(this.total(), this.tamano()));
  readonly paginaActual = computed(() => paginaValida(this.pagina(), this.total(), this.tamano()));
  readonly desde = computed(() => (this.total() ? (this.paginaActual() - 1) * this.tamano() + 1 : 0));
  readonly hasta = computed(() => Math.min(this.paginaActual() * this.tamano(), this.total()));
  readonly visible = computed(() =>
    this.opcionesTamano().length ? this.total() > 0 : this.total() > this.tamano()
  );

  ir(pagina: number): void {
    this.pagina.set(paginaValida(pagina, this.total(), this.tamano()));
  }

  cambiarTamano(evento: Event): void {
    this.tamano.set(Number((evento.target as HTMLSelectElement).value));
    this.pagina.set(1);
  }
}
