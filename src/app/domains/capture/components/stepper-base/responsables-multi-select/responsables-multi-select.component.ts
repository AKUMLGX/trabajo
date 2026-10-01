import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

import { CustomSelectComponent, SelectOption } from '../custom-select/custom-select.component';
import { separarListaTexto, unirListaTexto } from '../../../utils/lista-texto.utils';

@Component({
  selector: 'app-responsables-multi-select',
  imports: [CommonModule, FormsModule, CustomSelectComponent],
  templateUrl: './responsables-multi-select.component.html',
  styleUrl: './responsables-multi-select.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ResponsablesMultiSelectComponent),
      multi: true,
    },
  ],
})
export class ResponsablesMultiSelectComponent implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() label = 'Responsable';
  @Input() required = false;
  @Input() errorMessage: string | null = null;
  /** `value` = id de catálogo, `label` = nombre que se guarda. */
  @Input() opciones: SelectOption[] = [];

  /** Id del catálogo elegido en el selector, para acciones de editar/eliminar del padre. */
  @Output() catalogoSeleccionadoChange = new EventEmitter<number | string | null>();

  seleccionados: string[] = [];
  catalogoSeleccionado: number | string | null = null;
  nombreManual = '';
  disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.seleccionados = separarListaTexto(value ?? '');
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  onCatalogoChange(valor: number | string | null): void {
    this.catalogoSeleccionado = valor === '' ? null : valor;
    this.catalogoSeleccionadoChange.emit(this.catalogoSeleccionado);
  }

  agregarDesdeCatalogo(): void {
    const opcion = this.opciones.find(
      (item) => String(item.value) === String(this.catalogoSeleccionado)
    );
    if (opcion) {
      this.agregar(opcion.label);
    }
  }

  agregarManual(event?: Event): void {
    event?.preventDefault();
    if (this.agregar(this.nombreManual)) {
      this.nombreManual = '';
    }
  }

  quitar(nombre: string): void {
    if (this.disabled) {
      return;
    }
    this.seleccionados = this.seleccionados.filter((item) => item !== nombre);
    this.emitir();
  }

  estaSeleccionado(nombre: string): boolean {
    const normalizado = nombre.trim().toLowerCase();
    return this.seleccionados.some((item) => item.toLowerCase() === normalizado);
  }

  private agregar(nombre: string): boolean {
    const limpio = String(nombre ?? '').trim();
    if (this.disabled || !limpio || this.estaSeleccionado(limpio)) {
      return false;
    }
    this.seleccionados = [...this.seleccionados, limpio];
    this.emitir();
    return true;
  }

  private emitir(): void {
    this.onChange(unirListaTexto(this.seleccionados));
    this.onTouched();
    this.cdr.markForCheck();
  }
}
