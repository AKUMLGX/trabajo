import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { CustomFormFieldComponent } from '../../../capture/components/stepper-base/custom-form-field/custom-form-field.component';
import { CustomSelectComponent, SelectOption } from '../../../capture/components/stepper-base/custom-select/custom-select.component';
import { CustomTextareaComponent } from '../../../capture/components/stepper-base/custom-textarea/custom-textarea.component';
import { SistemaAplicativoAutocompleteComponent } from '../../../capture/components/stepper-base/sistema-aplicativo-autocomplete/sistema-aplicativo-autocomplete.component';
import { UsuariosRequerimientoComponent } from '../../../capture/components/usuarios-requerimiento/usuarios-requerimiento/usuarios-requerimiento.component';
import { ResponsablesMultiSelectComponent } from '../../../capture/components/stepper-base/responsables-multi-select/responsables-multi-select.component';
import { unirListaTexto } from '../../../capture/utils/lista-texto.utils';
import { CatalogoReworkCacheService } from '../../../capture/services/catalogo-rework-cache.service';
import { CatalogoReworkItem } from '../../../capture/interfaces/expediente-rework.interface';
import { CatalogoResponsableResponse } from '../../../interfaces/catalogos.interface';
import {
  ExpedienteDetalleCaptura,
  ExpedienteEdicionFormValores,
} from '../../interfaces/expediente-detalle-captura.interface';
import { UsuarioRequerimiento } from '../../../interfaces/usuarios-expediente.interface';
import { DateUtils } from '../../../capture/utils/date-utils';
import { estatusSeleccionables, etiquetaEstatus, normalizarTextoCatalogo } from '../../../shared/utils/catalogo-estatus.utils';

@Component({
  selector: 'app-expediente-captura-edit-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomFormFieldComponent,
    CustomSelectComponent,
    CustomTextareaComponent,
    SistemaAplicativoAutocompleteComponent,
    UsuariosRequerimientoComponent,
    ResponsablesMultiSelectComponent,
  ],
  templateUrl: './expediente-captura-edit-form.component.html',
  styleUrl: './expediente-captura-edit-form.component.css',
})
export class ExpedienteCapturaEditFormComponent implements OnInit, OnDestroy {
  @Input({ required: true }) detalle!: ExpedienteDetalleCaptura;
  /** Oculta cabecera interna y aplica layout de modal (grid 2 columnas). */
  @Input() enModal = false;
  @Output() cancelar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<ExpedienteEdicionFormValores>();

  formulario: FormGroup;
  usuarios: UsuarioRequerimiento[] = [];

  opcionesServicio: SelectOption[] = [];
  opcionesEstatus: SelectOption[] = [];
  opcionesUbicacion: SelectOption[] = [];
  opcionesResponsables: SelectOption[] = [];

  private responsablesData: CatalogoResponsableResponse[] = [];
  private readonly destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private catalogoCache: CatalogoReworkCacheService
  ) {
    this.formulario = this.fb.group({
      servicio: [null, Validators.required],
      numero_entrada_central: [''],
      aplicativos: ['', Validators.required],
      responsable: ['', Validators.required],
      status: [null, Validators.required],
      observaciones: [''],
      ubicacion: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.usuarios = [...(this.detalle.usuarios ?? [])];
    this.cargarCatalogos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onUsuariosChange(usuarios: UsuarioRequerimiento[]): void {
    this.usuarios = usuarios;
  }

  onCancelar(): void {
    this.cancelar.emit();
  }

  onGuardar(): void {
    if (this.formulario.invalid) {
      Object.keys(this.formulario.controls).forEach((key) => {
        this.formulario.get(key)?.markAsTouched();
      });
      return;
    }

    const raw = this.formulario.getRawValue();

    this.guardar.emit({
      expediente: this.valorFormulario(this.detalle.expediente),
      oficio: this.valorFormulario(this.detalle.oficio),
      servicio: raw.servicio,
      numero_entrada_central: raw.numero_entrada_central ?? '',
      remitente: this.valorFormulario(this.detalle.remitente),
      fecha_documento: this.fechaLatamAInput(this.detalle.fecha_documento),
      fecha_recepcion: this.fechaLatamAInput(this.detalle.fecha_recepcion),
      prioridad: this.detalle.prioridad_id ?? null,
      fecha_vencimiento: this.fechaLatamAInput(this.detalle.fecha_vencimiento),
      asunto: this.valorFormulario(this.detalle.asunto),
      usuarios: [...this.usuarios],
      aplicativos: unirListaTexto(raw.aplicativos),
      responsable: unirListaTexto(raw.responsable),
      status: raw.status,
      observaciones: raw.observaciones ?? '',
      ubicacion: raw.ubicacion,
    });
  }

  private cargarCatalogos(): void {
    this.catalogoCache
      .getCatalogosEdicion()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respuestas) => {
          this.opcionesServicio = this.mapearCatalogo(respuestas.servicios);
          const idEstatusActual =
            this.detalle.status_id ??
            respuestas.estatus.find((i) => normalizarTextoCatalogo(i.descripcion) === normalizarTextoCatalogo(this.detalle.estatus))?.id_exp;
          this.opcionesEstatus = this.mapearCatalogo(
            estatusSeleccionables(respuestas.estatus, idEstatusActual).map((i) => ({ ...i, descripcion: etiquetaEstatus(i.descripcion) }))
          );
          this.opcionesUbicacion = this.mapearCatalogo(respuestas.ubicaciones);

          this.responsablesData = respuestas.responsables;
          this.opcionesResponsables = this.responsablesData.map((item) => ({
            value: item.id_aplicativo,
            label: item.nombre,
          }));

          this.precargarFormulario();
        },
        error: () => {
          this.precargarFormulario();
        },
      });
  }

  private mapearCatalogo(items: CatalogoReworkItem[]): SelectOption[] {
    return items.map((item) => ({
      value: item.id_exp,
      label: item.descripcion.split('(')[0].trim(),
    }));
  }

  private precargarFormulario(): void {
    this.formulario.patchValue({
      servicio: this.detalle.servicio_id ?? this.resolverIdCatalogo(this.opcionesServicio, this.detalle.servicio),
      numero_entrada_central: this.valorFormulario(this.detalle.numero_entrada_central),
      aplicativos: unirListaTexto(this.valorFormulario(this.detalle.aplicativos)),
      responsable: unirListaTexto(this.valorFormulario(this.detalle.responsable)),
      status: this.detalle.status_id ?? this.resolverIdCatalogo(this.opcionesEstatus, etiquetaEstatus(this.detalle.estatus)),
      observaciones: this.valorFormulario(this.detalle.observaciones),
      ubicacion: this.detalle.ubicacion_id ?? this.resolverIdCatalogo(this.opcionesUbicacion, this.detalle.ubicacion),
    });
  }

  private valorFormulario(valor: string | null | undefined): string {
    if (!valor || valor.trim() === '-' || valor.trim().toLowerCase() === 'n/a') {
      return '';
    }
    return valor.trim();
  }

  private resolverIdCatalogo(opciones: SelectOption[], etiqueta: string): number | null {
    const normalizada = etiqueta?.trim().toLowerCase();
    if (!normalizada || normalizada === '-') {
      return null;
    }

    const coincidencia = opciones.find(
      (opcion) => String(opcion.label).trim().toLowerCase() === normalizada
    );
    return coincidencia?.value ?? null;
  }

  private fechaLatamAInput(fecha: string | null | undefined): string {
    return DateUtils.formatearFechaInput(fecha) || '';
  }
}
