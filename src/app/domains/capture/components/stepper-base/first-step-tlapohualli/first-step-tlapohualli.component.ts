import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomFormFieldComponent } from '../custom-form-field/custom-form-field.component';
import { CustomTextareaComponent } from '../custom-textarea/custom-textarea.component';
import { ExpedienteValidators } from '../../../utils/form-validators';
import { oficioExistenteValidator } from '../../../utils/async-validators';
import { ExpedienteAutocompleteService } from '../../../services/expediente-autocomplete.service';
import { ExpedienteTlapohualliService } from '../../../services/expediente-tlapohualli.service';

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
  validandoOficio: boolean = false; // Indicador de validación en progreso

  // Catálogos para autocompletado
  remitentesComunes: string[] = [
    'Dirección General de Auditoría',
    'Subdirección de Revisión Fiscal',
    'Administración Local SAT',
    'Área Jurídica',
    'Área de Fiscalización',
    'Coordinación de Dictámenes',
    'Subdirección de Recursos',
    'Área de Cobranza'
  ];

  get formularioValido(): boolean {
    return this.formulario.valid;
  }

  constructor(
    private fb: FormBuilder,
    private autocompleteService: ExpedienteAutocompleteService,
    private expedienteService: ExpedienteTlapohualliService
  ) {
    this.formulario = this.fb.group({
      // OFICIO: Campo más importante (clave única) con validación asíncrona
      oficio: ['', 
        // Validadores síncronos
        [
          Validators.required,
          Validators.maxLength(100),
          ExpedienteValidators.oficioFormat()
        ],
        // Validadores asíncronos (verificar si ya existe)
        [oficioExistenteValidator(this.expedienteService)]
      ],
      // EXPEDIENTE: Auto-rellenado y no editable
      expediente: [{ value: '', disabled: false }, [
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
      // PLAZO DE ATENCIÓN: Valores separados para días y horas
      plazo_dias: ['', [
        Validators.min(0),
        Validators.max(999)
      ]],
      plazo_horas: ['', [
        Validators.min(0),
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

    // Validación dinámica de plazo según unidad seleccionada
    this.formulario.get('plazo_unidad')?.valueChanges.subscribe((unidad) => {
      this.actualizarValidadoresPlazo(unidad);
    });

    // Observar el estado de validación del oficio (para mostrar indicador)
    this.formulario.get('oficio')?.statusChanges.subscribe((status) => {
      this.validandoOficio = (status === 'PENDING');
      console.log('📝 Estado del campo oficio:', status, '- Validando:', this.validandoOficio);
    });

    // Emitir validez del formulario cuando cambia
    this.formulario.statusChanges.subscribe(() => {
      this.validezCambiada.emit(this.formulario.valid);
    });

    // Emitir validez inicial
    this.validezCambiada.emit(this.formulario.valid);

    // Obtener y AUTO-CARGAR el siguiente expediente
    this.cargarYAplicarSiguienteExpediente();
  }

  // Actualizar validadores de plazo según la unidad seleccionada
  actualizarValidadoresPlazo(unidad: string) {
    const plazo_dias = this.formulario.get('plazo_dias');
    const plazo_horas = this.formulario.get('plazo_horas');

    // Limpiar validadores previos
    plazo_dias?.clearValidators();
    plazo_horas?.clearValidators();

    if (unidad === 'dias') {
      // Solo días es obligatorio
      plazo_dias?.setValidators([Validators.required, Validators.min(1), Validators.max(999)]);
      plazo_horas?.setValidators([Validators.min(0), Validators.max(999)]);
      this.formulario.patchValue({ plazo_horas: '' }, { emitEvent: false });
    } else if (unidad === 'horas') {
      // Solo horas es obligatorio
      plazo_horas?.setValidators([Validators.required, Validators.min(1), Validators.max(999)]);
      plazo_dias?.setValidators([Validators.min(0), Validators.max(999)]);
      this.formulario.patchValue({ plazo_dias: '' }, { emitEvent: false });
    } else if (unidad === 'ambos') {
      // Ambos son obligatorios
      plazo_dias?.setValidators([Validators.required, Validators.min(1), Validators.max(999)]);
      plazo_horas?.setValidators([Validators.required, Validators.min(1), Validators.max(999)]);
    }

    plazo_dias?.updateValueAndValidity();
    plazo_horas?.updateValueAndValidity();
  }

  // Cargar y APLICAR AUTOMÁTICAMENTE el siguiente expediente
  cargarYAplicarSiguienteExpediente() {
    this.autocompleteService.obtenerSiguienteExpediente().subscribe({
      next: (siguiente) => {
        this.siguienteExpediente = siguiente;
        // AUTO-APLICAR el expediente y BLOQUEAR el campo
        this.formulario.patchValue({
          expediente: siguiente
        });
        this.formulario.get('expediente')?.disable();
        console.log('✅ Expediente auto-cargado y bloqueado:', siguiente);
      },
      error: (err) => {
        console.error('Error al obtener siguiente expediente:', err);
        // Si falla, dejar el campo editable
        this.formulario.get('expediente')?.enable();
      }
    });
  }

  // Recargar expediente (por si el usuario necesita uno nuevo)
  recargarExpediente() {
    this.cargarYAplicarSiguienteExpediente();
  }

  onSubmit() {
    console.log('=== VALIDACIÓN PASO 1 ===');
    console.log('Formulario válido:', this.formulario.valid);
    console.log('Valores del formulario:', this.formulario.value);
    
    if (this.formulario.valid) {
      console.log('✅ Paso 1 VÁLIDO - Continuando...');
      
      // Obtener valor del expediente (aunque esté deshabilitado)
      const expedienteUsado = this.formulario.get('expediente')?.value || this.siguienteExpediente;
      if (expedienteUsado) {
        this.autocompleteService.guardarUltimoExpediente(expedienteUsado);
      }

      // Construir objeto completo incluyendo campos deshabilitados
      const datosFormulario = {
        ...this.formulario.getRawValue(), // getRawValue incluye campos deshabilitados
        plazo_vencimiento_prioridad: this.construirPlazo()
      };

      console.log('📦 Datos Paso 1:', datosFormulario);

      // Solo emitir formularioCompletado, el stepper se encargará de avanzar
      this.formularioCompletado.emit(datosFormulario);
    } else {
      console.error('❌ Paso 1 INVÁLIDO - Campos con errores:');
      this.marcarCamposInvalidos();
      this.mostrarCamposInvalidos();
    }
  }

  // Construir objeto de plazo con toda la información
  private construirPlazo() {
    const unidad = this.formulario.get('plazo_unidad')?.value;
    const dias = parseInt(this.formulario.get('plazo_dias')?.value || '0');
    const horas = parseInt(this.formulario.get('plazo_horas')?.value || '0');
    const es_urgente = this.formulario.get('es_urgente')?.value;

    let textoCompleto = '';
    let valorTotal = 0;

    if (unidad === 'dias') {
      textoCompleto = `${dias} día${dias !== 1 ? 's' : ''}`;
      valorTotal = dias;
    } else if (unidad === 'horas') {
      textoCompleto = `${horas} hora${horas !== 1 ? 's' : ''}`;
      valorTotal = horas;
    } else if (unidad === 'ambos') {
      textoCompleto = `${dias} día${dias !== 1 ? 's' : ''} y ${horas} hora${horas !== 1 ? 's' : ''}`;
      // Convertir todo a horas para cálculos: días*24 + horas
      valorTotal = (dias * 24) + horas;
    }

    if (es_urgente) {
      textoCompleto += ' (URGENTE)';
    }

    return {
      valor: valorTotal,
      dias: dias,
      horas: horas,
      unidad: unidad,
      texto_completo: textoCompleto,
      es_urgente: es_urgente
    };
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
      alert(`⚠️ PASO 1 - Faltan los siguientes campos:\n\n${camposInvalidos.join('\n')}`);
    }
  }

  // Getters para mensajes de error
  get oficioError(): string | null {
    const control = this.formulario.get('oficio');
    
    // Mostrar indicador de validación
    if (control?.status === 'PENDING') {
      return 'Verificando disponibilidad...';
    }
    
    // Errores después de tocar el campo
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Campo clave única obligatorio';
      if (control.errors['maxlength']) return 'Máximo 100 caracteres';
      if (control.errors['oficioFormat']) return control.errors['oficioFormat'].message;
      
      // ERROR DE DUPLICADO
      if (control.errors['oficioExistente']) {
        return control.errors['oficioExistente'].message;
      }
    }
    
    // Sin errores - mostrar ícono de éxito si ya fue validado
    if (control?.valid && control?.value && control?.value.length >= 5) {
      return '✅ Oficio disponible';
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
