import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  OficioAdjuntoExpediente,
  OficioAdjuntoGuardadoEvent,
} from '../../interfaces/expediente-detalle-captura.interface';
import { DateUtils } from '../../../capture/utils/date-utils';

export type ModoOficioAdjuntoForm = 'crear' | 'editar';

@Component({
  selector: 'app-oficio-adjunto-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './oficio-adjunto-form.component.html',
  styleUrl: './oficio-adjunto-form.component.css',
})
export class OficioAdjuntoFormComponent {
  private readonly fb = inject(FormBuilder);

  @Input() guardando = false;
  @Input() mensajeApi = '';
  @Input() modo: ModoOficioAdjuntoForm = 'crear';
  @Input() localIdEdicion: string | null = null;
  /** Oficio ya persistido en servidor (no badge LOCAL). */
  @Input() enServidor = false;
  @Output() guardar = new EventEmitter<OficioAdjuntoGuardadoEvent>();
  @Output() cancelar = new EventEmitter<void>();

  pdfSeleccionado: File | null = null;
  pdfNombreMostrado = '';
  pdfError: string | null = null;
  pdfExistente = false;
  pdfArrastrando = false;

  readonly formulario = this.fb.nonNullable.group({
    num_oficio: ['', [Validators.required, Validators.minLength(1)]],
    fecha_documento: [''],
    fecha_recepcion: [''],
    fecha_vencimiento: [''],
    asunto: [''],
  });

  get esEdicion(): boolean {
    return this.modo === 'editar';
  }

  get tituloFormulario(): string {
    return this.esEdicion ? 'Editar oficio adjunto' : 'Nuevo oficio adjunto';
  }

  get subtituloFormulario(): string {
    return this.esEdicion
      ? 'Modifique los datos y guarde. Puede reemplazar el PDF o conservar el actual.'
      : 'Capture el oficio / atenta nota, fechas, asunto y adjunte el PDF.';
  }

  get textoBotonGuardar(): string {
    if (this.guardando) {
      return this.esEdicion ? 'Guardando cambios...' : 'Guardando...';
    }
    return this.esEdicion ? 'Guardar cambios' : 'Guardar oficio';
  }

  cargarParaEdicion(oficio: OficioAdjuntoExpediente): void {
    this.formulario.patchValue({
      num_oficio: oficio.num_oficio ?? '',
      fecha_documento: DateUtils.toInputDate(oficio.fecha_documento) ?? '',
      fecha_recepcion: DateUtils.toInputDate(oficio.fecha_recepcion) ?? '',
      fecha_vencimiento: DateUtils.toInputDate(oficio.fecha_vencimiento) ?? '',
      asunto: oficio.asunto ?? '',
    });

    this.pdfSeleccionado = null;
    this.pdfNombreMostrado = oficio.nombre_archivo ?? '';
    this.pdfExistente = Boolean(oficio.nombre_archivo?.trim());
    this.pdfError = null;
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.asignarArchivoPdf(file);
    input.value = '';
  }

  onPdfDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    this.pdfArrastrando = true;
  }

  onPdfDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.pdfArrastrando = false;
  }

  onPdfDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.pdfArrastrando = false;
    this.asignarArchivoPdf(event.dataTransfer?.files?.[0] ?? null);
  }

  private asignarArchivoPdf(file: File | null): void {
    if (!file) {
      return;
    }

    const esPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!esPdf) {
      this.pdfError = 'Sólo se aceptan archivos PDF';
      this.pdfSeleccionado = null;
      if (!this.esEdicion) {
        this.pdfNombreMostrado = '';
      }
      return;
    }

    this.pdfSeleccionado = file;
    this.pdfNombreMostrado = file.name;
    this.pdfExistente = false;
    this.pdfError = null;
  }

  limpiarArchivo(): void {
    this.pdfSeleccionado = null;
    this.pdfNombreMostrado = '';
    this.pdfExistente = false;
    this.pdfError = null;
    this.pdfArrastrando = false;
  }

  onSubmit(): void {
    this.formulario.markAllAsTouched();

    const requierePdf = !this.esEdicion;
    const tienePdf = Boolean(this.pdfSeleccionado) || (this.esEdicion && this.pdfExistente);

    if (this.formulario.invalid || (requierePdf && !tienePdf)) {
      if (!tienePdf) {
        this.pdfError = 'Seleccione un archivo PDF';
      }
      return;
    }

    const valores = this.formulario.getRawValue();
    const nombreArchivo =
      this.pdfSeleccionado?.name ??
      (this.esEdicion && this.pdfNombreMostrado ? this.pdfNombreMostrado : '');

    const oficio: OficioAdjuntoExpediente = {
      num_oficio: valores.num_oficio.trim(),
      fecha_documento: valores.fecha_documento?.trim() || undefined,
      fecha_recepcion: valores.fecha_recepcion?.trim() || undefined,
      fecha_vencimiento: valores.fecha_vencimiento?.trim() || undefined,
      asunto: valores.asunto?.trim() || undefined,
      nombre_archivo: nombreArchivo,
      fecha_registro: new Date().toISOString(),
      pendiente_endpoint: true,
      localId: this.localIdEdicion ?? undefined,
    };

    this.guardar.emit({
      oficio,
      archivo: this.pdfSeleccionado,
      localId: this.localIdEdicion ?? undefined,
    });
  }

  onCancelar(): void {
    this.resetFormulario();
    this.cancelar.emit();
  }

  resetFormulario(): void {
    this.formulario.reset();
    this.limpiarArchivo();
    this.pdfExistente = false;
  }

  campoInvalido(campo: 'num_oficio'): boolean {
    const control = this.formulario.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
