import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-third-step-tlapohualli',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './third-step-tlapohualli.component.html',
  styleUrl: './third-step-tlapohualli.component.css'
})
export class ThirdStepTlapohualliComponent {
  @Input() datosPaso1: any = {};
  @Input() datosPaso2: any = {};
  @Output() formularioCompletado = new EventEmitter<any>();
  @Output() finalizar = new EventEmitter<void>();
  @Output() pasoAnterior = new EventEmitter<void>();

  formulario: FormGroup;
  pdfSeleccionado: File | null = null;
  pdfNombreMostrado = '';
  pdfError: string | null = null;

  /**
   * Campos de documentación que se retiraron temporalmente en esta fase del proyecto.
   * Se listan para retomarlos posteriormente cuando la app los requiera de nuevo.
   */
  readonly camposDocumentosPendientes = [
    'tipo_documento',
    'anexos',
    'acuse_fisico_digital',
    'expediente_fisico_digital',
    'comentarios_omega'
  ];

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      documento_pdf: [null, Validators.required]
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;

    if (!file) {
      this.limpiarArchivo();
      return;
    }

    if (file.type !== 'application/pdf') {
      this.pdfError = 'Sólo se aceptan archivos PDF';
      this.formulario.get('documento_pdf')?.setErrors({ formatoInvalido: true });
      this.pdfSeleccionado = null;
      this.pdfNombreMostrado = '';
      return;
    }

    this.pdfSeleccionado = file;
    this.pdfNombreMostrado = file.name;
    this.pdfError = null;
    this.formulario.get('documento_pdf')?.setValue(file);
    this.formulario.get('documento_pdf')?.markAsTouched();
    this.formulario.get('documento_pdf')?.updateValueAndValidity();
  }

  limpiarArchivo() {
    this.pdfSeleccionado = null;
    this.pdfNombreMostrado = '';
    this.pdfError = null;
    this.formulario.get('documento_pdf')?.setValue(null);
    this.formulario.get('documento_pdf')?.markAsPristine();
    this.formulario.get('documento_pdf')?.markAsUntouched();
    this.formulario.get('documento_pdf')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      if (!this.pdfSeleccionado) {
        this.pdfError = 'Selecciona un PDF para continuar';
      }
      return;
    }

    const datosFormulario = {
      documento_pdf: this.pdfSeleccionado,
      campos_pospuestos: this.camposDocumentosPendientes
    };

    this.formularioCompletado.emit(datosFormulario);
  }

  goBack() {
    this.pasoAnterior.emit();
  }
}
