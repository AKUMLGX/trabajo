import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormularioPaso2 } from '../../../interfaces/expediente-tlapohualli.interface';
import { CustomFormFieldComponent } from '../custom-form-field/custom-form-field.component';
import { CustomSelectComponent } from '../custom-select/custom-select.component';
import { CustomTextareaComponent } from '../custom-textarea/custom-textarea.component';

@Component({
  selector: 'app-second-step-tlapohualli',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomFormFieldComponent,
    CustomSelectComponent,
    CustomTextareaComponent
  ],
  templateUrl: './second-step-tlapohualli.component.html',
  styleUrl: './second-step-tlapohualli.component.css'
})
export class SecondStepTlapohualliComponent {
  @Input() datosPaso1: any = {};
  @Output() formularioCompletado = new EventEmitter<FormularioPaso2>();
  @Output() siguientePaso = new EventEmitter<void>();
  @Output() pasoAnterior = new EventEmitter<void>();

  formularioPaso2: FormGroup;

  // Opciones para dropdowns
  sistemasAplicativo = [
    { value: 'Sistema Central', label: 'Sistema Central' },
    { value: 'Aplicativo Especializado', label: 'Aplicativo Especializado' },
    { value: 'Sistema Externo', label: 'Sistema Externo' },
    { value: 'No aplica', label: 'No aplica' }
  ];

  estatusOpciones = [
    { value: 'En Proceso', label: 'En Proceso' },
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Completado', label: 'Completado' },
    { value: 'Cancelado', label: 'Cancelado' },
    { value: 'En Revisión', label: 'En Revisión' },
    { value: 'ATENDIDO', label: 'ATENDIDO' }
  ];

  tiposRespuesta = [
    { value: 'Total', label: 'Total' },
    { value: 'Parcial', label: 'Parcial' },
    { value: 'Sin Respuesta', label: 'Sin Respuesta' }
  ];

  ubicacionesCarpeta = [
    { value: 'Carpeta General - 1', label: 'Carpeta General - 1' },
    { value: 'Carpeta General - 2', label: 'Carpeta General - 2' },
    { value: 'Carpeta Individual - 1', label: 'Carpeta Individual - 1' },
    { value: 'Carpeta Individual - 2', label: 'Carpeta Individual - 2' },
    { value: 'Archivo Digital', label: 'Archivo Digital' }
  ];

  constructor(private fb: FormBuilder) {
    this.formularioPaso2 = this.fb.group({
      // Plazos y fechas
      plazo_vencimiento_prioridad: [null, [Validators.min(1), Validators.max(365)]],
      fecha_vencimiento: [null],
      dias_retraso: [0, [Validators.min(0)]],
      fecha_notificacion: [null],
      
      // Sistema y responsables
      sistema_aplicativo: [''],
      responsable_fecha_asignacion: ['', [Validators.maxLength(255)]],
      woos: ['', [Validators.maxLength(50)]],
      numero_solicitudes_reales: ['0', [Validators.pattern(/^\d+$/)]],
      
      // Estado y seguimiento
      observaciones: ['', [Validators.maxLength(1000)]],
      estatus: [''],
      ubicacion_carpeta: [''],
      respuesta_total_parcial: [''],
      referencia_respuesta: ['', [Validators.maxLength(100)]]
    });

    // Auto-calcular fecha de vencimiento cuando cambie el plazo
    this.formularioPaso2.get('plazo_vencimiento_prioridad')?.valueChanges.subscribe(plazo => {
      if (plazo && this.datosPaso1.fecha_recibido) {
        const fechaRecibido = new Date(this.datosPaso1.fecha_recibido);
        const fechaVencimiento = new Date(fechaRecibido);
        fechaVencimiento.setDate(fechaRecibido.getDate() + plazo);
        this.formularioPaso2.patchValue({ fecha_vencimiento: fechaVencimiento });
        this.calcularDiasRetraso();
      }
    });

    // Auto-calcular días de retraso cuando cambie la fecha de vencimiento
    this.formularioPaso2.get('fecha_vencimiento')?.valueChanges.subscribe(() => {
      this.calcularDiasRetraso();
    });
  }

  calcularDiasRetraso() {
    const fechaVencimiento = this.formularioPaso2.get('fecha_vencimiento')?.value;
    if (fechaVencimiento) {
      const hoy = new Date();
      const vencimiento = new Date(fechaVencimiento);
      const diferencia = Math.ceil((hoy.getTime() - vencimiento.getTime()) / (1000 * 60 * 60 * 24));
      const diasRetraso = Math.max(0, diferencia);
      this.formularioPaso2.patchValue({ dias_retraso: diasRetraso });
    }
  }

  onSubmit() {
    if (this.formularioPaso2.valid) {
      const datosPaso2: FormularioPaso2 = {
        plazo_vencimiento_prioridad: this.formularioPaso2.value.plazo_vencimiento_prioridad,
        fecha_vencimiento: this.formularioPaso2.value.fecha_vencimiento,
        dias_retraso: this.formularioPaso2.value.dias_retraso,
        sistema_aplicativo: this.formularioPaso2.value.sistema_aplicativo,
        responsable_fecha_asignacion: this.formularioPaso2.value.responsable_fecha_asignacion,
        woos: this.formularioPaso2.value.woos,
        numero_solicitudes_reales: this.formularioPaso2.value.numero_solicitudes_reales,
        observaciones: this.formularioPaso2.value.observaciones,
        estatus: this.formularioPaso2.value.estatus,
        ubicacion_carpeta: this.formularioPaso2.value.ubicacion_carpeta,
        respuesta_total_parcial: this.formularioPaso2.value.respuesta_total_parcial,
        referencia_respuesta: this.formularioPaso2.value.referencia_respuesta,
        fecha_notificacion: this.formularioPaso2.value.fecha_notificacion
      };

      this.formularioCompletado.emit(datosPaso2);
      this.siguientePaso.emit();
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.formularioPaso2.controls).forEach(key => {
        this.formularioPaso2.get(key)?.markAsTouched();
      });
    }
  }

  onSiguiente() {
    this.siguientePaso.emit();
  }

  onAnterior() {
    this.pasoAnterior.emit();
  }

  // Getters para validación de errores
  get plazoError(): string | null {
    const control = this.formularioPaso2.get('plazo_vencimiento_prioridad');
    if (control?.touched && control?.errors) {
      if (control.errors['min']) return 'Mínimo 1 día';
      if (control.errors['max']) return 'Máximo 365 días';
    }
    return null;
  }

  get responsableError(): string | null {
    const control = this.formularioPaso2.get('responsable_fecha_asignacion');
    if (control?.touched && control?.errors) {
      if (control.errors['maxlength']) return 'Máximo 255 caracteres';
    }
    return null;
  }

  get woosError(): string | null {
    const control = this.formularioPaso2.get('woos');
    if (control?.touched && control?.errors) {
      if (control.errors['maxlength']) return 'Máximo 50 caracteres';
    }
    return null;
  }

  get observacionesError(): string | null {
    const control = this.formularioPaso2.get('observaciones');
    if (control?.touched && control?.errors) {
      if (control.errors['maxlength']) return 'Máximo 1000 caracteres';
    }
    return null;
  }

  get respuestaError(): string | null {
    const control = this.formularioPaso2.get('respuesta_total_parcial');
    if (control?.touched && control?.errors) {
      if (control.errors['maxlength']) return 'Máximo 100 caracteres';
    }
    return null;
  }

  get numeroSolicitudesError(): string | null {
    const control = this.formularioPaso2.get('numero_solicitudes_reales');
    if (control?.touched && control?.errors) {
      if (control.errors['pattern']) return 'Solo se permiten números';
    }
    return null;
  }

  // Métodos para obtener opciones
  get sistemasOptions() {
    return this.sistemasAplicativo;
  }

  get estatusOptions() {
    return this.estatusOpciones;
  }

  get tiposRespuestaOptions() {
    return this.tiposRespuesta;
  }

  get ubicacionesOptions() {
    return this.ubicacionesCarpeta;
  }
}
