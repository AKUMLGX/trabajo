import { Component, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomFormFieldComponent } from '../custom-form-field/custom-form-field.component';
import { CustomSelectComponent, SelectOption } from '../custom-select/custom-select.component';
import { LoggerService } from '../../../services/logger.service';
import { FormHelperService } from '../../../services/form-helper.service';
import { Subject, takeUntil, debounceTime } from 'rxjs';

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
export class SecondStepTlapohualliComponent implements OnInit, OnDestroy {
  @Input() datosPaso1: any = {};
  @Output() formularioCompletado = new EventEmitter<any>();
  @Output() siguientePaso = new EventEmitter<void>();
  @Output() pasoAnterior = new EventEmitter<void>();

  formulario: FormGroup;
  private destroy$ = new Subject<void>();
  
  // Progreso del formulario
  progresoFormulario = 0;
  camposCompletados = 0;
  camposTotales = 0;
  
  // Opciones para el dropdown de responsables
  opcionesResponsables: SelectOption[] = [
    { value: 'Irma Guerrero', label: 'Irma Guerrero' },
    { value: 'Héctor Sanchez', label: 'Héctor Sanchez' },
    { value: 'Carlos Hernández', label: 'Carlos Hernández' }
  ];

  
  // Opciones para los selects
  opcionesEstatus: SelectOption[] = [
    { value: 'ASIGNADO', label: 'Asignado' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'ATENCION_PARCIAL', label: 'Atención parcial' },
    { value: 'ATENCION_TOTAL', label: 'Atención total' },
    { value: 'REVISION_LEGAL', label: 'Revisión legal' }
  ];

  // Opciones para prioridad del expediente (movido al Step 1)



  readonly camposDocumentosPendientes = [
    'tipo_documento',
    'anexos',
    'acuse_fisico_digital',
    'expediente_fisico_digital',
    'comentarios_omega'
  ];

  constructor(
    private fb: FormBuilder,
    private logger: LoggerService,
    private formHelper: FormHelperService
  ) {
    // Obtener fecha de hoy en formato YYYY-MM-DD
    const hoy = this.formHelper.getFechaActual();
    
    this.formulario = this.fb.group({
      // Campos de entrada
      responsable: ['', [Validators.required, Validators.maxLength(100)]]
      // prioridad movido al Step 1
      // fecha_asignacion y estatus eliminados
      // sistema_aplicativo movido al modal de atención en Centro de Control
    });
  }


  ngOnInit() {
    // Calcular campos totales
    this.camposTotales = Object.keys(this.formulario.controls).length;
    
    // Calcular progreso inicial
    this.calcularProgreso();
    
    // Suscribirse a cambios para actualizar progreso y guardar borrador
    this.formulario.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.calcularProgreso();
        this.guardarBorrador();
      });
    
    // Cargar borrador si existe
    this.cargarBorrador();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Calcular progreso del formulario
   */
  calcularProgreso(): void {
    let completados = 0;
    Object.keys(this.formulario.controls).forEach(key => {
      const control = this.formulario.get(key);
      if (control && control.value !== null && control.value !== '' && control.value !== false) {
        completados++;
      }
    });
    this.camposCompletados = completados;
    this.progresoFormulario = Math.round((completados / this.camposTotales) * 100);
  }

  /**
   * Guardar borrador automáticamente
   */
  private guardarBorrador(): void {
    const datos = this.formulario.getRawValue();
    this.formHelper.guardarBorrador(2, datos);
  }

  /**
   * Cargar borrador si existe
   */
  private cargarBorrador(): void {
    const borrador = this.formHelper.obtenerBorrador(2);
    if (borrador) {
      const datosCargar: any = {};
      Object.keys(borrador).forEach(key => {
        if (key !== 'documento_pdf_nombre') {
          const control = this.formulario.get(key);
          if (control && (!control.value || control.value === '')) {
            datosCargar[key] = borrador[key];
          }
        }
      });
      
      if (Object.keys(datosCargar).length > 0) {
        this.formulario.patchValue(datosCargar, { emitEvent: false });
        this.logger.debug('Borrador Paso 2 cargado:', Object.keys(datosCargar).length, 'campos');
      }
    }
  }

  onSubmit() {
    this.logger.debug('Validando Paso 2 - Formulario válido:', this.formulario.valid);

    if (this.formulario.invalid) {
      this.logger.warn('Paso 2 inválido - Campos con errores');
      this.marcarCamposInvalidos();
      this.mostrarCamposInvalidos();
      return;
    }

    this.logger.debug('Paso 2 válido - Continuando');
    const valores = this.formulario.getRawValue();
    this.formularioCompletado.emit({
      ...valores,
      campos_pospuestos: this.camposDocumentosPendientes
    });
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
        this.logger.debug(`Campo inválido: ${key}`, {
          errors: control.errors
        });
        camposInvalidos.push(key);
      }
    });
    
    if (camposInvalidos.length > 0) {
      // Mostrar error con modal (se implementará después)
      const mensaje = `⚠️ PASO 2 - Faltan los siguientes campos:\n\n${camposInvalidos.map(c => `• ${c}`).join('\n')}`;
      alert(mensaje); // TODO: Reemplazar con modal
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



  // get prioridadError movido al Step 1

}
