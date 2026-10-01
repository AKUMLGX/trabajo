import {
  Component,
  Input,
  forwardRef,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

import { ApiService } from '../../../services/api.service';
import {
  ActualizarAplicativoDTO,
  Aplicativo,
  CrearAplicativoDTO,
  MensajeResponse,
} from '../../../interfaces/aplicativo.interface';
import { CustomModalComponent2 } from '../../../../responsables/components/atencion-modal/custom-modal/custom-modal/custom-modal.component';
import { separarListaTexto, unirListaTexto } from '../../../utils/lista-texto.utils';

type AplicativoCrudo = Record<string, unknown>;

@Component({
  selector: 'app-sistema-aplicativo-autocomplete',
  imports: [CommonModule, FormsModule, MatSnackBarModule, CustomModalComponent2],
  templateUrl: './sistema-aplicativo-autocomplete.component.html',
  styleUrl: './sistema-aplicativo-autocomplete.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SistemaAplicativoAutocompleteComponent),
      multi: true,
    },
  ],
})
export class SistemaAplicativoAutocompleteComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  private readonly apiService = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  @Input() label = 'Aplicativo / Sistema';
  @Input() required = false;
  @Input() errorMessage: string | null = null;
  @Input() placeholder = 'Busca o escribe un aplicativo o sistema';
  @Input() hint = 'Selecciona del catálogo o escribe uno nuevo';
  /** El valor del control es la lista unida con `; `. */
  @Input() multiple = false;

  seleccionados: string[] = [];
  aplicativos: Aplicativo[] = [];
  aplicativosFiltrados: Aplicativo[] = [];
  dropdownAbierto = false;
  busqueda = '';
  isFocused = false;
  disabled = false;
  cargandoAplicativos = false;

  modalEliminarVisible = false;
  modalEditarVisible = false;
  aplicativoSeleccionado: Aplicativo | null = null;

  fieldId = 'sistema-aplicativo-' + Math.random().toString(36).substring(2, 11);

  private value = '';
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.cargarAplicativos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  writeValue(value: string | null): void {
    this.value = value ?? '';
    if (this.multiple) {
      this.seleccionados = separarListaTexto(this.value);
      this.busqueda = '';
    } else {
      this.busqueda = this.value;
    }
    this.cdr.detectChanges();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.detectChanges();
  }

  getNombre(app: Aplicativo): string {
    return (app.nombre ?? '').trim();
  }

  onInputChange(): void {
    if (!this.multiple) {
      this.actualizarValor(this.busqueda ?? '');
    }
    this.dropdownAbierto = true;
    this.filtrarAplicativos();
  }

  onEnter(event: Event): void {
    if (!this.multiple) {
      return;
    }
    event.preventDefault();
    const nombre = (this.busqueda ?? '').trim();
    if (nombre) {
      this.seleccionarAplicativo(nombre);
    }
  }

  estaSeleccionado(nombre: string): boolean {
    const normalizado = nombre.trim().toLowerCase();
    return this.multiple
      ? this.seleccionados.some((item) => item.toLowerCase() === normalizado)
      : this.busqueda === nombre;
  }

  quitarSeleccion(nombre: string): void {
    if (this.disabled) {
      return;
    }
    this.seleccionados = this.seleccionados.filter((item) => item !== nombre);
    this.actualizarValor(unirListaTexto(this.seleccionados));
    this.onTouched();
    this.cdr.detectChanges();
  }

  onFocus(): void {
    this.isFocused = true;
    this.dropdownAbierto = true;
    this.filtrarAplicativos();
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
    this.cerrarDropdown();
  }

  toggleDropdown(): void {
    if (this.disabled) {
      return;
    }
    this.dropdownAbierto = !this.dropdownAbierto;
    if (this.dropdownAbierto) {
      this.filtrarAplicativos();
    }
  }

  seleccionarAplicativo(nombre: string): void {
    const nombreLimpio = nombre.trim();
    if (this.multiple) {
      if (nombreLimpio && !this.estaSeleccionado(nombreLimpio)) {
        this.seleccionados = [...this.seleccionados, nombreLimpio];
        this.actualizarValor(unirListaTexto(this.seleccionados));
      }
      this.busqueda = '';
    } else {
      this.busqueda = nombreLimpio;
      this.actualizarValor(nombreLimpio);
    }
    this.dropdownAbierto = false;
    this.cdr.detectChanges();
  }

  crearDesdeBusqueda(): void {
    const nombre = (this.busqueda ?? '').trim();
    if (!nombre || this.existeAplicativo(nombre)) {
      return;
    }
    this.crearAplicativo(nombre);
  }

  esEditable(app: Aplicativo): boolean {
    return app.id_aplicativo > 40;
  }

  editarAplicativo(app: Aplicativo): void {
    if (app.es_sistema) {
      this.snackBar.open('No se pueden modificar aplicativos predefinidos.', 'Cerrar', {
        duration: 4000,
      });
      return;
    }
    this.aplicativoSeleccionado = app;
    this.modalEditarVisible = true;
  }

  eliminarAplicativo(app: Aplicativo): void {
    if (app.es_sistema) {
      this.snackBar.open('No se pueden eliminar aplicativos predefinidos.', 'Cerrar', {
        duration: 4000,
      });
      return;
    }
    this.aplicativoSeleccionado = app;
    this.modalEliminarVisible = true;
  }

  cerrarModalAplicativo(): void {
    this.modalEliminarVisible = false;
    this.modalEditarVisible = false;
    this.aplicativoSeleccionado = null;
  }

  confirmarEdicionAplicativo(nombre: string | void): void {
    if (!this.aplicativoSeleccionado) {
      return;
    }

    const nombreLimpio = typeof nombre === 'string' ? nombre.trim() : '';
    if (!nombreLimpio) {
      return;
    }

    const nombreAnterior = this.getNombre(this.aplicativoSeleccionado);
    const body: ActualizarAplicativoDTO = {
      id_aplicativo: this.aplicativoSeleccionado.id_aplicativo,
      nombre: nombreLimpio,
    };

    this.apiService
      .updateAplicativo<MensajeResponse>(body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Aplicativo actualizado correctamente.', 'Cerrar', {
            duration: 3000,
          });
          this.cerrarModalAplicativo();
          if (this.multiple) {
            this.reemplazarSeleccion(nombreAnterior, nombreLimpio);
            this.cargarAplicativos();
            return;
          }
          const seleccionado = this.value === nombreAnterior ? nombreLimpio : undefined;
          this.cargarAplicativos(seleccionado);
        },
        error: () => {
          this.snackBar.open('Error al actualizar aplicativo.', 'Cerrar', {
            duration: 4000,
          });
        },
      });
  }

  confirmarEliminacionAplicativo(): void {
    if (!this.aplicativoSeleccionado) {
      return;
    }

    const eliminado = this.getNombre(this.aplicativoSeleccionado);

    this.apiService
      .deleteAplicativo<MensajeResponse>(this.aplicativoSeleccionado.id_aplicativo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Aplicativo eliminado correctamente.', 'Cerrar', {
            duration: 3000,
          });

          if (this.multiple) {
            this.reemplazarSeleccion(eliminado, null);
          } else if (this.value === eliminado) {
            this.busqueda = '';
            this.actualizarValor('');
          }

          this.cerrarModalAplicativo();
          this.cargarAplicativos();
        },
        error: () => {
          this.snackBar.open('Error al eliminar aplicativo.', 'Cerrar', {
            duration: 4000,
          });
        },
      });
  }

  existeAplicativo(nombre: string): boolean {
    const normalizado = nombre.trim().toLowerCase();
    return this.aplicativos.some(
      (app) => this.getNombre(app).toLowerCase() === normalizado
    );
  }

  private actualizarValor(nombre: string): void {
    this.value = nombre;
    this.onChange(nombre);
  }

  private reemplazarSeleccion(anterior: string, nuevo: string | null): void {
    if (!this.seleccionados.includes(anterior)) {
      return;
    }
    const actualizados = this.seleccionados.flatMap((item) =>
      item === anterior ? (nuevo ? [nuevo] : []) : [item]
    );
    this.seleccionados = separarListaTexto(actualizados);
    this.actualizarValor(unirListaTexto(this.seleccionados));
  }

  private filtrarAplicativos(): void {
    const busqueda = (this.busqueda ?? '').trim().toLowerCase();
    this.aplicativosFiltrados = busqueda
      ? this.aplicativos.filter((app) =>
          this.getNombre(app).toLowerCase().includes(busqueda)
        )
      : [...this.aplicativos];
    this.cdr.detectChanges();
  }

  private cerrarDropdown(): void {
    setTimeout(() => {
      this.dropdownAbierto = false;
      this.cdr.detectChanges();
    }, 150);
  }

  private cargarAplicativos(seleccionarNombre?: string): void {
    this.cargandoAplicativos = true;

    this.apiService
      .getData<Aplicativo[]>('catalogo/aplicativos', true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: HttpResponse<Aplicativo[]>) => {
          const data = this.parseAplicativosResponse(response.body);
          this.aplicativos = data.map((app) => this.normalizarAplicativo(app));
          this.filtrarAplicativos();

          if (seleccionarNombre) {
            this.seleccionarAplicativo(seleccionarNombre);
          } else if (this.value && !this.multiple) {
            this.busqueda = this.value;
          }

          this.cargandoAplicativos = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.snackBar.open('Error al cargar aplicativos.', 'Cerrar', {
            duration: 4000,
          });
          this.aplicativos = [];
          this.aplicativosFiltrados = [];
          this.cargandoAplicativos = false;
          this.cdr.detectChanges();
        },
      });
  }

  private crearAplicativo(nombre: string): void {
    const nombreLimpio = nombre.trim();
    const body: CrearAplicativoDTO = { nombre: nombreLimpio };

    this.apiService
      .postData<MensajeResponse>('catalogo/aplicativos', body, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Aplicativo creado correctamente.', 'Cerrar', {
            duration: 3000,
          });
          this.cargarAplicativos(nombreLimpio);
        },
        error: () => {
          this.snackBar.open('Error al crear aplicativo.', 'Cerrar', {
            duration: 4000,
          });
        },
      });
  }

  private parseAplicativosResponse(body: unknown): AplicativoCrudo[] {
    if (Array.isArray(body)) {
      return body.map((item) => {
        if (typeof item === 'string') {
          return { nombre: item };
        }
        if (item && typeof item === 'object') {
          return item as AplicativoCrudo;
        }
        return {};
      });
    }

    if (body && typeof body === 'object') {
      const objeto = body as AplicativoCrudo;
      for (const key of ['data', 'aplicativos', 'items', 'result']) {
        const anidado = objeto[key];
        if (Array.isArray(anidado)) {
          return this.parseAplicativosResponse(anidado);
        }
      }
    }

    return [];
  }

  private normalizarAplicativo(raw: AplicativoCrudo): Aplicativo {
    const id = Number(raw['id_aplicativo'] ?? raw['id'] ?? 0);
    const nombre = String(
      raw['nombre'] ??
        raw['aplicativo'] ??
        raw['descripcion'] ??
        raw['nombre_sistema'] ??
        ''
    ).trim();

    return {
      id_aplicativo: Number.isFinite(id) ? id : 0,
      nombre,
      es_sistema: id > 0 && id <= 40,
      es_usuario: Boolean(raw['es_usuario']),
    };
  }
}
