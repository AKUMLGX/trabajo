import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormularioPaso3 } from '../../../interfaces/expediente-tlapohualli.interface';
import { CustomFormFieldComponent } from '../custom-form-field/custom-form-field.component';
import { CustomSelectComponent } from '../custom-select/custom-select.component';
import { CustomTextareaComponent } from '../custom-textarea/custom-textarea.component';

@Component({
  selector: 'app-third-step-tlapohualli',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CustomFormFieldComponent,
    CustomSelectComponent,
    CustomTextareaComponent
  ],
  templateUrl: './third-step-tlapohualli.component.html',
  styleUrl: './third-step-tlapohualli.component.css'
})
export class ThirdStepTlapohualliComponent {
  @Input() datosPaso1: any = {};
  @Input() datosPaso2: any = {};
  @Output() formularioCompletado = new EventEmitter<FormularioPaso3>();
  @Output() finalizar = new EventEmitter<void>();
  @Output() pasoAnterior = new EventEmitter<void>();

  formularioPaso3: FormGroup;

  // Opciones para dropdowns
  tiposDocumentoRespuesta = [
    { value: 'Dictamen', label: 'Dictamen' },
    { value: 'Reporte', label: 'Reporte' },
    { value: 'Acta de Hechos', label: 'Acta de Hechos' },
    { value: 'Memoria Técnica', label: 'Memoria Técnica' },
    { value: 'Sin Información', label: 'Sin Información' }
  ];

  opcionesAcuse = [
    { value: 'RRI-2501-001', label: 'RRI-2501-001' },
    { value: 'RRI-2501-002', label: 'RRI-2501-002' },
    { value: 'RRI-2501-003', label: 'RRI-2501-003' },
    { value: 'Otro', label: 'Otro' }
  ];

  opcionesExpedienteFisicoDigital = [
    { value: true, label: 'SÍ' },
    { value: false, label: 'NO' }
  ];

  // Chips para anexos
  anexosChips: string[] = [];
  nuevoAnexo = '';

  constructor(private fb: FormBuilder) {
    this.formularioPaso3 = this.fb.group({
      oficios_comision_apoyo: ['', [Validators.maxLength(255)]],
      dictamen_reporte_acta: [''],
      anexos: [''],
      acuse_fisico_digital: ['', [Validators.maxLength(100)]],
      expediente_fisico_digital: [false],
      comentarios_omega: ['', [Validators.maxLength(1000)]]
    });

    // Inicializar chips de anexos
    this.anexosChips = [];
  }

  agregarAnexo() {
    if (this.nuevoAnexo.trim() && !this.anexosChips.includes(this.nuevoAnexo.trim())) {
      this.anexosChips.push(this.nuevoAnexo.trim());
      this.actualizarCampoAnexos();
      this.nuevoAnexo = '';
    }
  }

  removerAnexo(anexo: string) {
    this.anexosChips = this.anexosChips.filter(a => a !== anexo);
    this.actualizarCampoAnexos();
  }

  actualizarCampoAnexos() {
    const anexosString = this.anexosChips.join(', ');
    this.formularioPaso3.patchValue({ anexos: anexosString });
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.agregarAnexo();
    }
  }

  onSubmit() {
    if (this.formularioPaso3.valid) {
      const datosPaso3: FormularioPaso3 = {
        oficios_comision_apoyo: this.formularioPaso3.value.oficios_comision_apoyo,
        dictamen_reporte_acta: this.formularioPaso3.value.dictamen_reporte_acta,
        anexos: this.formularioPaso3.value.anexos,
        acuse_fisico_digital: this.formularioPaso3.value.acuse_fisico_digital,
        expediente_fisico_digital: this.formularioPaso3.value.expediente_fisico_digital,
        comentarios_omega: this.formularioPaso3.value.comentarios_omega
      };

      this.formularioCompletado.emit(datosPaso3);
      this.finalizar.emit();
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.formularioPaso3.controls).forEach(key => {
        this.formularioPaso3.get(key)?.markAsTouched();
      });
    }
  }

  onFinalizar() {
    this.finalizar.emit();
  }

  onAnterior() {
    this.pasoAnterior.emit();
  }

  // Getters para validación de errores
  get oficiosError(): string | null {
    const control = this.formularioPaso3.get('oficios_comision_apoyo');
    if (control?.touched && control?.errors) {
      if (control.errors['maxlength']) return 'Máximo 255 caracteres';
    }
    return null;
  }

  get acuseError(): string | null {
    const control = this.formularioPaso3.get('acuse_fisico_digital');
    if (control?.touched && control?.errors) {
      if (control.errors['maxlength']) return 'Máximo 100 caracteres';
    }
    return null;
  }

  get comentariosError(): string | null {
    const control = this.formularioPaso3.get('comentarios_omega');
    if (control?.touched && control?.errors) {
      if (control.errors['maxlength']) return 'Máximo 1000 caracteres';
    }
    return null;
  }

  // Métodos para obtener opciones
  get tiposDocumentoOptions() {
    return this.tiposDocumentoRespuesta;
  }

  get acuseOptions() {
    return this.opcionesAcuse;
  }

  get expedienteFisicoDigitalOptions() {
    return this.opcionesExpedienteFisicoDigital;
  }

  // Método para generar resumen de todos los pasos
  generarResumen() {
    return {
      paso1: this.datosPaso1,
      paso2: this.datosPaso2,
      paso3: this.formularioPaso3.value
    };
  }
}
