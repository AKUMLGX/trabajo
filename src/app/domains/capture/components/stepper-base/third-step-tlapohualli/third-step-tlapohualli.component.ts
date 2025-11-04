import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomFormFieldComponent } from '../custom-form-field/custom-form-field.component';
import { CustomSelectComponent, SelectOption } from '../custom-select/custom-select.component';
import { CustomTextareaComponent } from '../custom-textarea/custom-textarea.component';

@Component({
  selector: 'app-third-step-tlapohualli',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomFormFieldComponent,
    CustomSelectComponent,
    CustomTextareaComponent
  ],
  templateUrl: './third-step-tlapohualli.component.html',
  styleUrl: './third-step-tlapohualli.component.css'
})
export class ThirdStepTlapohualliComponent implements OnInit {
  @Input() datosPaso1: any = {};
  @Input() datosPaso2: any = {};
  @Output() formularioCompletado = new EventEmitter<any>();
  @Output() finalizar = new EventEmitter<void>();
  @Output() pasoAnterior = new EventEmitter<void>();

  formulario: FormGroup;
  
  // Opciones para los selects
  opcionesTipoDocumento: SelectOption[] = [
    { value: 'DICTAMEN', label: 'Dictamen' },
    { value: 'REPORTE', label: 'Reporte' },
    { value: 'ACTA_HECHOS', label: 'Acta de Hechos' },
    { value: 'MEMORIA_TECNICA', label: 'Memoria Técnica' },
    { value: 'SIN_INFO', label: 'Sin Información' }
  ];

  opcionesExpedienteFisicoDigital: SelectOption[] = [
    { value: 'FISICO', label: 'Solo Físico' },
    { value: 'DIGITAL', label: 'Solo Digital' },
    { value: 'AMBOS', label: 'Físico y Digital' },
    { value: 'NINGUNO', label: 'Ninguno' }
  ];

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      // Tipo de documento principal
      tipo_documento: ['', Validators.required],
      
      // Anexos (opcional)
      anexos: ['', Validators.maxLength(500)],
      
      // Acuse físico/digital
      acuse_fisico_digital: ['', Validators.maxLength(100)],
      
      // Expediente físico y digital
      expediente_fisico_digital: ['', Validators.required],
      
      // Comentarios finales (Omega)
      comentarios_omega: ['', Validators.maxLength(2000)]
    });
  }

  ngOnInit() {
    // Inicialización si es necesaria
  }

  onSubmit() {
    if (this.formulario.valid) {
      const datosFormulario = this.formulario.value;
      
      this.formularioCompletado.emit(datosFormulario);
      this.finalizar.emit();
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
  get tipoDocumentoError(): string | null {
    const control = this.formulario.get('tipo_documento');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
    }
    return null;
  }

  get expedienteFisicoDigitalError(): string | null {
    const control = this.formulario.get('expediente_fisico_digital');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Obligatorio';
    }
    return null;
  }
}
