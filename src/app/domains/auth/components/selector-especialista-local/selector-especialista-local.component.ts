import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';

import { EspecialistaSesion } from '../../../interfaces/oauth2.interfaces';
import { SeguimientoAsignacionService } from '../../../responsables/services/seguimiento-asignacion.service';
import { agruparEspecialistasPorPersona } from '../../../responsables/utils/asignacion-especialista.utils';
import { fusionarCatalogoConSemillaCorrelacion } from '../../../responsables/utils/correlacion-especialistas.utils';

/** Solo modo local: simula qué especialista es el usuario hasta que el back lo resuelva por RFC. */
@Component({
  selector: 'app-selector-especialista-local',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="mt-2 block border-t border-white/10 px-1 pt-2">
      <span class="mb-1 block font-noto-sans text-[10px] font-semibold uppercase tracking-[1.5px] text-white/55">
        Especialista
      </span>
      @if (error()) {
        <span class="block font-noto-sans text-[11px] text-[#f3c9c9]">No se pudo cargar el catálogo</span>
      } @else {
        <select
          class="w-full rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 font-noto-sans text-xs text-white outline-none focus:border-[#d6ae67]"
          [value]="seleccionado()?.nombre ?? ''"
          (change)="elegir($any($event.target).value)">
          <option value="" disabled class="text-tlalcalli-dark">{{ personas().length ? 'Elige un especialista' : 'Cargando…' }}</option>
          @for (p of personas(); track p.nombre) {
            <option [value]="p.nombre" class="text-tlalcalli-dark">{{ p.nombre }}</option>
          }
        </select>
      }
    </label>
  `,
})
export class SelectorEspecialistaLocalComponent implements OnInit {
  readonly seleccionado = input<EspecialistaSesion | null>(null);
  readonly seleccionadoChange = output<EspecialistaSesion | null>();

  readonly personas = signal<EspecialistaSesion[]>([]);
  readonly error = signal(false);

  private readonly seguimiento = inject(SeguimientoAsignacionService);

  ngOnInit(): void {
    this.seguimiento.obtenerEspecialistas().subscribe({
      next: (lista) => {
        const personas = agruparEspecialistasPorPersona(fusionarCatalogoConSemillaCorrelacion(lista));
        this.personas.set(personas);
        const actual = this.seleccionado();
        if (actual) {
          this.seleccionadoChange.emit(personas.find((p) => p.nombre === actual.nombre) ?? null);
        }
      },
      error: () => this.error.set(true),
    });
  }

  elegir(nombre: string): void {
    this.seleccionadoChange.emit(this.personas().find((p) => p.nombre === nombre) ?? null);
  }
}
