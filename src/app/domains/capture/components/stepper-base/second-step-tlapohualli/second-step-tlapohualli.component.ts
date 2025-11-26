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
  
  // Catálogo de responsables frecuentes
  responsablesComunes: string[] = [
    'Juan Pérez García',
    'María López Sánchez',
    'Carlos Rodríguez Díaz',
    'Ana Martínez Gómez',
    'Luis Hernández Torres',
    'Patricia González Ramírez',
    'Jorge Sánchez Flores',
    'Laura Díaz Castro'
  ];

  sistemasAplicativos: string[] = [
    'Tlapohualli',
    'Sistema Integral SAT',
    'SIGE',
    'SIAF',
    'Portal OMEGA'
  ];

  // Obtener opciones de autocompletado combinando comunes e historial
  get responsablesConHistorial(): string[] {
    const historial = this.formHelper.obtenerHistorial('responsable');
    const todos = [...historial, ...this.responsablesComunes];
    return Array.from(new Set(todos));
  }

  get sistemasConHistorial(): string[] {
    const historial = this.formHelper.obtenerHistorial('sistema_aplicativo');
    const todos = [...historial, ...this.sistemasAplicativos];
    return Array.from(new Set(todos));
  }
  
  // Opciones para los selects
  opcionesEstatus: SelectOption[] = [
    { value: 'EN_TRAMITE', label: 'En Trámite' },
    { value: 'ATENDIDO', label: 'Atendido' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'CANCELADO', label: 'Cancelado' }
  ];

  opcionesUbicacion: SelectOption[] = [
    { value: 'CARPETA_GENERAL_I', label: 'Carpeta General I' },
    { value: 'CARPETA_GENERAL_II', label: 'Carpeta General II' },
    { value: 'CARPETA_GENERAL_III', label: 'Carpeta General III' },
    { value: 'CARPETA_GENERAL_IV', label: 'Carpeta General IV' },
    { value: 'CARPETA_GENERAL_V', label: 'Carpeta General V' },
    { value: 'CARPETA_INDIVIDUAL', label: 'Carpeta Individual' }
  ];

  pdfSeleccionado: File | null = null;
  pdfNombreMostrado = '';
  pdfTamanoMostrado = '';
  pdfError: string | null = null;

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
      sistema_aplicativo: ['', [Validators.required, Validators.maxLength(100)]],
      responsable: ['', [Validators.required, Validators.maxLength(100)]],
      fecha_asignacion: [hoy, Validators.required], // HOY por defecto
      estatus: ['PENDIENTE', Validators.required], // PENDIENTE por defecto
      ubicacion: ['', Validators.maxLength(50)],
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

    // Validar tipo de archivo
    if (file.type !== 'application/pdf') {
      this.pdfError = 'Sólo se aceptan archivos PDF';
      this.formulario.get('documento_pdf')?.setErrors({ formatoInvalido: true });
      this.pdfSeleccionado = null;
      this.pdfNombreMostrado = '';
      return;
    }

    // Validar tamaño máximo (10MB)
    const MAX_SIZE_MB = 10;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      this.pdfError = `El archivo es demasiado grande (${fileSizeMB} MB). Tamaño máximo permitido: ${MAX_SIZE_MB} MB`;
      this.formulario.get('documento_pdf')?.setErrors({ tamañoExcedido: true });
      this.pdfSeleccionado = null;
      this.pdfNombreMostrado = '';
      return;
    }

    // Archivo válido
    this.pdfSeleccionado = file;
    this.pdfNombreMostrado = file.name;
    // Mostrar tamaño del archivo
    const tamañoMB = (file.size / (1024 * 1024)).toFixed(2);
    this.pdfTamanoMostrado = `${tamañoMB} MB`;
    this.pdfError = null;
    this.formulario.get('documento_pdf')?.setValue(file);
    this.formulario.get('documento_pdf')?.markAsTouched();
    this.formulario.get('documento_pdf')?.updateValueAndValidity();
  }

  limpiarArchivo() {
    this.pdfSeleccionado = null;
    this.pdfNombreMostrado = '';
    this.pdfTamanoMostrado = '';
    this.pdfError = null;
    this.formulario.get('documento_pdf')?.setValue(null);
    this.formulario.get('documento_pdf')?.markAsPristine();
    this.formulario.get('documento_pdf')?.markAsUntouched();
    this.formulario.get('documento_pdf')?.updateValueAndValidity();
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
      // Para el PDF, verificar si está seleccionado
      if (key === 'documento_pdf') {
        if (this.pdfSeleccionado) completados++;
      } else if (control && control.value !== null && control.value !== '' && control.value !== false) {
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
    const datos = {
      ...this.formulario.getRawValue(),
      documento_pdf_nombre: this.pdfNombreMostrado
    };
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

    if (this.formulario.invalid || !this.pdfSeleccionado) {
      this.logger.warn('Paso 2 inválido - Campos con errores');
      if (!this.pdfSeleccionado) {
        this.pdfError = 'Selecciona un PDF para continuar';
        this.formulario.get('documento_pdf')?.setErrors({ requerido: true });
      }
      this.marcarCamposInvalidos();
      this.mostrarCamposInvalidos();
      return;
    }

    this.logger.debug('Paso 2 válido - Continuando');
    const valores = this.formulario.getRawValue();
    this.formularioCompletado.emit({
      ...valores,
      documento_pdf: this.pdfSeleccionado,
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

  get sistemaAplicativoError(): string | null {
    const control = this.formulario.get('sistema_aplicativo');
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
      if (control.errors['maxlength']) return 'Máximo 50 caracteres';
    }
    return null;
  }

}
