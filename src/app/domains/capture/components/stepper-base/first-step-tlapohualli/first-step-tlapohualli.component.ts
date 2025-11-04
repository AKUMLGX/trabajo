import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomFormFieldComponent } from '../custom-form-field/custom-form-field.component';
import { CustomTextareaComponent } from '../custom-textarea/custom-textarea.component';
import { ExpedienteValidators } from '../../../utils/form-validators';
import { ExpedienteAutocompleteService } from '../../../services/expediente-autocomplete.service';

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
  @Output() validezCambiada = new EventEmitter<boolean>();

  formulario: FormGroup;
  siguienteExpediente: string = '';

  get formularioValido(): boolean {
    return this.formulario.valid;
  }

  constructor(
    private fb: FormBuilder,
    private autocompleteService: ExpedienteAutocompleteService
  ) {
    this.formulario = this.fb.group({
      // OFICIO: Campo más importante (clave única)
      oficio: ['', [
        Validators.required,
        Validators.maxLength(100),
        ExpedienteValidators.oficioFormat()
      ]],
      expediente: ['', [
        Validators.required,
        Validators.maxLength(50),
        ExpedienteValidators.expedienteFormat()
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
      // PLAZO DE ATENCIÓN: Valor entero
      plazo_valor: ['', [
        Validators.required,
        Validators.min(1),
        Validators.max(999)
      ]],
      // Unidad de tiempo: dias, horas, ambos
      plazo_unidad: ['dias', Validators.required],
      // Checkbox urgente
      es_urgente: [false]
    });
  }

  ngOnInit() {
    // Revalidar fecha_recibido cuando cambia fecha_documento
    this.formulario.get('fecha_documento')?.valueChanges.subscribe(() => {
      this.formulario.get('fecha_recibido')?.updateValueAndValidity();
    });

    // Emitir validez del formulario cuando cambia
    this.formulario.statusChanges.subscribe(() => {
      this.validezCambiada.emit(this.formulario.valid);
    });

    // Emitir validez inicial
    this.validezCambiada.emit(this.formulario.valid);

    // Obtener sugerencia del siguiente expediente
    this.cargarSiguienteExpediente();
  }

  // Cargar el siguiente número de expediente sugerido
  cargarSiguienteExpediente() {
    this.autocompleteService.obtenerSiguienteExpediente().subscribe({
      next: (siguiente) => {
        this.siguienteExpediente = siguiente;
      },
      error: (err) => {
        console.error('Error al obtener siguiente expediente:', err);
      }
    });
  }

  // Aplicar el expediente sugerido
  aplicarExpedienteSugerido() {
    if (this.siguienteExpediente) {
      this.formulario.patchValue({
        expediente: this.siguienteExpediente
      });
    }
  }

  onSubmit() {
    if (this.formulario.valid) {
      // Guardar expediente usado para próxima sugerencia
      const expedienteUsado = this.formulario.get('expediente')?.value;
      if (expedienteUsado) {
        this.autocompleteService.guardarUltimoExpediente(expedienteUsado);
      }

      // Construir objeto de plazo completo
      const datosFormulario = {
        ...this.formulario.value,
        plazo_vencimiento_prioridad: this.construirPlazo()
      };
      
      this.formularioCompletado.emit(datosFormulario);
      this.siguientePaso.emit();
    } else {
      this.marcarCamposInvalidos();
    }
  }

  // Construir objeto de plazo con toda la información
  private construirPlazo() {
    return {
      valor: parseInt(this.formulario.get('plazo_valor')?.value),
      unidad: this.formulario.get('plazo_unidad')?.value,
      es_urgente: this.formulario.get('es_urgente')?.value
    };
  }

  private marcarCamposInvalidos() {
    Object.keys(this.formulario.controls).forEach(key => {
      const control = this.formulario.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }
  
  // Getters para mensajes de error
  get oficioError(): string | null {
    const control = this.formulario.get('oficio');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Campo clave única obligatorio';
      if (control.errors['maxlength']) return 'Máximo 100 caracteres';
      if (control.errors['oficioFormat']) return control.errors['oficioFormat'].message;
    }
    return null;
  }

  get expedienteError(): string | null {
    const control = this.formulario.get('expediente');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
      if (control.errors['maxlength']) return 'Máximo 50 caracteres';
      if (control.errors['expedienteFormat']) return control.errors['expedienteFormat'].message;
    }
    return null;
  }
  
  get numeroEntradaError(): string | null {
    const control = this.formulario.get('numero_entrada_central');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
      if (control.errors['maxlength']) return 'Máximo 100 caracteres';
    }
    return null;
  }
  
  get remitenteError(): string | null {
    const control = this.formulario.get('remitente_area');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
      if (control.errors['maxlength']) return 'Máximo 50 caracteres';
    }
    return null;
  }
  
  get fechaDocumentoError(): string | null {
    const control = this.formulario.get('fecha_documento');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
      if (control.errors['futureDate']) return control.errors['futureDate'].message;
    }
    return null;
  }
  
  get fechaRecibidoError(): string | null {
    const control = this.formulario.get('fecha_recibido');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
      if (control.errors['futureDate']) return control.errors['futureDate'].message;
      if (control.errors['fechaRecibidoInvalida']) return control.errors['fechaRecibidoInvalida'].message;
    }
    return null;
  }
  
  get referenciaError(): string | null {
    const control = this.formulario.get('referencia_asunto');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
      if (control.errors['maxlength']) return 'Máximo 1000 caracteres';
    }
    return null;
  }
  
  get plazoValorError(): string | null {
    const control = this.formulario.get('plazo_valor');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
      if (control.errors['min']) return 'Mínimo 1';
      if (control.errors['max']) return 'Máximo 999';
    }
    return null;
  }

  // Verificar si el formulario puede continuar
  get puedeAvanzar(): boolean {
    return this.formulario.valid;
  }
}
