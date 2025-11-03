import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomFormFieldComponent } from '../custom-form-field/custom-form-field.component';
import { CustomTextareaComponent } from '../custom-textarea/custom-textarea.component';
import { ExpedienteValidators } from '../../../utils/form-validators';

@Component({
  selector: 'app-first-step-tlapohualli',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomFormFieldComponent,
    CustomTextareaComponent
  ],
  templateUrl: './first-step-tlapohualli.component.html',
  styleUrl: './first-step-tlapohualli.component.css'
})
export class FirstStepTlapohualliComponent implements OnInit {
  @Output() formularioCompletado = new EventEmitter<any>();
  @Output() siguientePaso = new EventEmitter<void>();

  formulario: FormGroup;
  tabActivo: number = 1; // Tab activo actual (1-4)

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      expediente: ['', [
        Validators.required,
        Validators.maxLength(50),
        ExpedienteValidators.expedienteFormat()
      ]],
      oficio: ['', [
        Validators.required,
        Validators.maxLength(100),
        ExpedienteValidators.oficioFormat()
      ]],
      numero_entrada_central: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],
      remitente_area: ['', [
        Validators.required,
        Validators.maxLength(50)
      ]],
      fecha_documento: ['', [
        Validators.required,
        ExpedienteValidators.noFutureDate()
      ]],
      fecha_recibido: ['', [
        Validators.required,
        ExpedienteValidators.noFutureDate(),
        ExpedienteValidators.fechaRecibidoValida()
      ]],
      referencia_asunto: ['', [
        Validators.required,
        Validators.maxLength(1000)
      ]],
      plazo_vencimiento_prioridad: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(365)
      ]]
    });
  }

  ngOnInit() {
    // Suscribirse a cambios de fecha_documento para revalidar fecha_recibido
    this.formulario.get('fecha_documento')?.valueChanges.subscribe(() => {
      this.formulario.get('fecha_recibido')?.updateValueAndValidity();
    });
  }

  onSubmit() {
    if (this.formulario.valid) {
      this.formularioCompletado.emit(this.formulario.value);
      this.siguientePaso.emit();
    } else {
      this.marcarCamposInvalidos();
    }
  }

  private marcarCamposInvalidos() {
    Object.keys(this.formulario.controls).forEach(key => {
      const control = this.formulario.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }

  // Verificar si una sección está completa
  isSeccionCompleta(seccion: number): boolean {
    switch(seccion) {
      case 1: // Identificación
        return this.formulario.get('expediente')?.valid === true &&
               this.formulario.get('oficio')?.valid === true &&
               this.formulario.get('numero_entrada_central')?.valid === true;
      
      case 2: // Fechas
        return this.formulario.get('fecha_documento')?.valid === true &&
               this.formulario.get('fecha_recibido')?.valid === true;
      
      case 3: // Origen
        return this.formulario.get('remitente_area')?.valid === true &&
               this.formulario.get('plazo_vencimiento_prioridad')?.valid === true;
      
      case 4: // Descripción
        return this.formulario.get('referencia_asunto')?.valid === true;
      
      default:
        return false;
    }
  }

  // Obtener número de campos completados
  getCamposCompletados(): number {
    return Object.keys(this.formulario.controls).filter(
      key => this.formulario.get(key)?.valid
    ).length;
  }
  
  // Getters para errores de validación
  get expedienteError(): string | null {
    const control = this.formulario.get('expediente');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'El expediente es obligatorio';
      if (control.errors['maxlength']) return 'Máximo 50 caracteres';
      if (control.errors['expedienteFormat']) return control.errors['expedienteFormat'].message;
    }
    return null;
  }
  
  get oficioError(): string | null {
    const control = this.formulario.get('oficio');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'El oficio es obligatorio';
      if (control.errors['maxlength']) return 'Máximo 100 caracteres';
      if (control.errors['oficioFormat']) return control.errors['oficioFormat'].message;
    }
    return null;
  }
  
  get numeroEntradaError(): string | null {
    const control = this.formulario.get('numero_entrada_central');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'El número de entrada es obligatorio';
      if (control.errors['maxlength']) return 'Máximo 100 caracteres';
    }
    return null;
  }
  
  get remitenteError(): string | null {
    const control = this.formulario.get('remitente_area');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'El remitente es obligatorio';
      if (control.errors['maxlength']) return 'Máximo 50 caracteres';
    }
    return null;
  }
  
  get fechaDocumentoError(): string | null {
    const control = this.formulario.get('fecha_documento');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'La fecha del documento es obligatoria';
      if (control.errors['futureDate']) return control.errors['futureDate'].message;
    }
    return null;
  }
  
  get fechaRecibidoError(): string | null {
    const control = this.formulario.get('fecha_recibido');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'La fecha de recepción es obligatoria';
      if (control.errors['futureDate']) return control.errors['futureDate'].message;
      if (control.errors['fechaRecibidoInvalida']) return control.errors['fechaRecibidoInvalida'].message;
    }
    return null;
  }
  
  get referenciaError(): string | null {
    const control = this.formulario.get('referencia_asunto');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'La referencia/asunto es obligatoria';
      if (control.errors['maxlength']) return 'Máximo 1000 caracteres';
    }
    return null;
  }
  
  get plazoError(): string | null {
    const control = this.formulario.get('plazo_vencimiento_prioridad');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'El plazo es obligatorio';
      if (control.errors['min']) return 'Mínimo 1 día';
      if (control.errors['max']) return 'Máximo 365 días';
    }
    return null;
  }

  // Getter para verificar si el formulario está completo
  get formularioValido(): boolean {
    return this.formulario.valid;
  }

  get porcentajeCompletado(): number {
    const totalCampos = Object.keys(this.formulario.controls).length;
    const camposValidos = Object.keys(this.formulario.controls).filter(
      key => this.formulario.get(key)?.valid
    ).length;
    return Math.round((camposValidos / totalCampos) * 100);
  }
}
