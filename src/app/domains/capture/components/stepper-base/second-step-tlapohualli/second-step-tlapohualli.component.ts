import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomFormFieldComponent } from '../custom-form-field/custom-form-field.component';
import { CustomSelectComponent, SelectOption } from '../custom-select/custom-select.component';
import { ExpedienteValidators } from '../../../utils/form-validators';

@Component({
  selector: 'app-second-step-tlapohualli',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomFormFieldComponent,
    CustomSelectComponent
  ],
  templateUrl: './second-step-tlapohualli.component.html',
  styleUrl: './second-step-tlapohualli.component.css'
})
export class SecondStepTlapohualliComponent implements OnInit {
  @Input() datosPaso1: any = {};
  @Output() formularioCompletado = new EventEmitter<any>();
  @Output() siguientePaso = new EventEmitter<void>();
  @Output() pasoAnterior = new EventEmitter<void>();

  formulario: FormGroup;
  
  // Opciones para los selects
  opcionesEstatus: SelectOption[] = [
    { value: 'EN_TRAMITE', label: 'En Trámite' },
    { value: 'ATENDIDO', label: 'Atendido' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'CANCELADO', label: 'Cancelado' }
  ];

  opcionesUbicacion: SelectOption[] = [
    { value: 'CARPETA_GENERAL', label: 'Carpeta General' },
    { value: 'CARPETA_INDIVIDUAL', label: 'Carpeta Individual' }
  ];

  opcionesRespuesta: SelectOption[] = [
    { value: 'TOTAL', label: 'Respuesta Total' },
    { value: 'PARCIAL', label: 'Respuesta Parcial' },
    { value: 'PENDIENTE', label: 'Pendiente de Respuesta' }
  ];

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      // Campos de fechas (EDITABLES AHORA)
      fecha_vencimiento: ['', Validators.required],
      dias_retraso: [0, [Validators.required, Validators.min(0)]],
      
      // Campos de entrada
      sistema_aplicativo: ['', Validators.maxLength(100)],
      responsable: ['', [Validators.required, Validators.maxLength(100)]],
      fecha_asignacion: ['', Validators.required],
      woos: ['', [
        Validators.required,
        ExpedienteValidators.woosFormat()
      ]],
      estatus: ['', Validators.required],
      ubicacion: ['', Validators.required],
      oficios_comision: ['', Validators.maxLength(200)],
      tipo_respuesta: ['', Validators.required],
      fecha_notificacion: ['']
    });
  }

  ngOnInit() {
    // Ya no hay cálculos automáticos
  }

  onSubmit() {
    console.log('=== VALIDACIÓN PASO 2 ===');
    console.log('Formulario válido:', this.formulario.valid);
    console.log('Valores del formulario:', this.formulario.value);
    
    if (this.formulario.valid) {
      console.log('✅ Paso 2 VÁLIDO - Continuando...');
      this.formularioCompletado.emit(this.formulario.value);
      this.siguientePaso.emit();
    } else {
      console.error('❌ Paso 2 INVÁLIDO - Campos con errores:');
      this.marcarCamposInvalidos();
      this.mostrarCamposInvalidos();
    }
  }

  private marcarCamposInvalidos() {
    Object.keys(this.formulario.controls).forEach(key => {
      const control = this.formulario.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }

  private mostrarCamposInvalidos() {
    const camposInvalidos: string[] = [];
    Object.keys(this.formulario.controls).forEach(key => {
      const control = this.formulario.get(key);
      if (control?.invalid) {
        console.error(`  ❌ ${key}:`, {
          value: control.value,
          errors: control.errors,
          touched: control.touched,
          dirty: control.dirty
        });
        camposInvalidos.push(key);
      }
    });
    
    if (camposInvalidos.length > 0) {
      alert(`⚠️ PASO 2 - Faltan los siguientes campos:\n\n${camposInvalidos.join('\n')}`);
    }
  }

  goBack() {
    this.pasoAnterior.emit();
  }

  // Getters para errores
  get responsableError(): string | null {
    const control = this.formulario.get('responsable');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
      if (control.errors['maxlength']) return 'Máximo 100 caracteres';
    }
    return null;
  }

  get fechaAsignacionError(): string | null {
    const control = this.formulario.get('fecha_asignacion');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
    }
    return null;
  }

  get woosError(): string | null {
    const control = this.formulario.get('woos');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
      if (control.errors['woosFormat']) return control.errors['woosFormat'].message;
    }
    return null;
  }

  get estatusError(): string | null {
    const control = this.formulario.get('estatus');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
    }
    return null;
  }

  get ubicacionError(): string | null {
    const control = this.formulario.get('ubicacion');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
    }
    return null;
  }

  get tipoRespuestaError(): string | null {
    const control = this.formulario.get('tipo_respuesta');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
    }
    return null;
  }
}
