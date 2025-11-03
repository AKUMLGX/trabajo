import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomFormFieldComponent } from '../custom-form-field/custom-form-field.component';
import { CustomSelectComponent, SelectOption } from '../custom-select/custom-select.component';
import { DateUtils } from '../../../utils/date-utils';
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
  
  // Campos calculados automáticamente
  fechaVencimiento: Date | null = null;
  diasRetraso: number = 0;
  
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
      // Campos calculados (readonly)
      fecha_vencimiento: [{ value: '', disabled: true }],
      dias_retraso: [{ value: 0, disabled: true }],
      
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
    if (this.datosPaso1) {
      this.calcularCamposAutomaticos();
    }
  }

  // Calcular fecha de vencimiento y días de retraso
  private calcularCamposAutomaticos() {
    if (this.datosPaso1.fecha_recibido && this.datosPaso1.plazo_vencimiento_prioridad) {
      const fechaRecibido = new Date(this.datosPaso1.fecha_recibido);
      const plazo = this.datosPaso1.plazo_vencimiento_prioridad.valor;
      
      // Calcular fecha de vencimiento
      this.fechaVencimiento = DateUtils.calcularFechaVencimiento(fechaRecibido, plazo);
      
      // Calcular días de retraso
      if (this.fechaVencimiento) {
        this.diasRetraso = DateUtils.calcularDiasRetraso(this.fechaVencimiento);
      }
      
      // Actualizar formulario
      this.formulario.patchValue({
        fecha_vencimiento: DateUtils.formatearFechaInput(this.fechaVencimiento),
        dias_retraso: this.diasRetraso
      });
    }
  }

  // Getters para el badge de días de retraso
  get colorRetraso(): string {
    return DateUtils.getClaseRetraso(this.diasRetraso);
  }

  get textoRetraso(): string {
    return DateUtils.getTextoRetraso(this.diasRetraso);
  }

  onSubmit() {
    if (this.formulario.valid) {
      const datosFormulario = {
        ...this.formulario.getRawValue(), // getRawValue() incluye campos disabled
        fecha_vencimiento: this.fechaVencimiento,
        dias_retraso: this.diasRetraso
      };
      
      this.formularioCompletado.emit(datosFormulario);
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
