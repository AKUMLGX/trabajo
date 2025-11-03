import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormularioPaso1 } from '../../../interfaces/expediente-tlapohualli.interface';
import { CustomFormFieldComponent } from '../custom-form-field/custom-form-field.component';
import { CustomSelectComponent } from '../custom-select/custom-select.component';
import { CustomTextareaComponent } from '../custom-textarea/custom-textarea.component';

@Component({
  selector: 'app-first-step-tlapohualli',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomFormFieldComponent,
    CustomSelectComponent,
    CustomTextareaComponent
  ],
  templateUrl: './first-step-tlapohualli.component.html',
  styleUrl: './first-step-tlapohualli.component.css'
})
export class FirstStepTlapohualliComponent {
  @Output() formularioCompletado = new EventEmitter<FormularioPaso1>();

  formularioPaso1: FormGroup;
  meses = [
    { value: 1, nombre: 'Enero' },
    { value: 2, nombre: 'Febrero' },
    { value: 3, nombre: 'Marzo' },
    { value: 4, nombre: 'Abril' },
    { value: 5, nombre: 'Mayo' },
    { value: 6, nombre: 'Junio' },
    { value: 7, nombre: 'Julio' },
    { value: 8, nombre: 'Agosto' },
    { value: 9, nombre: 'Septiembre' },
    { value: 10, nombre: 'Octubre' },
    { value: 11, nombre: 'Noviembre' },
    { value: 12, nombre: 'Diciembre' }
  ];

  constructor(private fb: FormBuilder) {
    this.formularioPaso1 = this.fb.group({
      expediente: ['', [Validators.required, Validators.maxLength(50)]],
      oficio: ['', [Validators.maxLength(100)]],
      numero_entrada_central: ['', [Validators.maxLength(100)]],
      remitente_area: ['', [Validators.maxLength(20)]],
      referencia_asunto: ['', [Validators.maxLength(500)]],
      fecha_documento: [null],
      mes_documento: [null],
      fecha_recibido: [null]
    });

    // Lógica automática del mes deshabilitada - el usuario selecciona manualmente
    // this.formularioPaso1.get('fecha_documento')?.valueChanges.subscribe(fecha => {
    //   // Lógica deshabilitada para permitir selección manual del mes
    // });
  }

  onSubmit() {
    if (this.formularioPaso1.valid) {
      const datosPaso1: FormularioPaso1 = {
        expediente: this.formularioPaso1.value.expediente,
        oficio: this.formularioPaso1.value.oficio,
        numero_entrada_central: this.formularioPaso1.value.numero_entrada_central,
        remitente_area: this.formularioPaso1.value.remitente_area,
        referencia_asunto: this.formularioPaso1.value.referencia_asunto,
        fecha_documento: this.formularioPaso1.value.fecha_documento,
        mes_documento: this.formularioPaso1.value.mes_documento,
        fecha_recibido: this.formularioPaso1.value.fecha_recibido
      };

      this.formularioCompletado.emit(datosPaso1);
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.formularioPaso1.controls).forEach(key => {
        this.formularioPaso1.get(key)?.markAsTouched();
      });
    }
  }


  // Getters para validación de errores
  get expedienteError(): string | null {
    const control = this.formularioPaso1.get('expediente');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'El expediente es obligatorio';
      if (control.errors['maxlength']) return 'Máximo 50 caracteres';
    }
    return null;
  }

  get oficioError(): string | null {
    const control = this.formularioPaso1.get('oficio');
    if (control?.touched && control?.errors) {
      if (control.errors['maxlength']) return 'Máximo 100 caracteres';
    }
    return null;
  }

  get remitenteAreaError(): string | null {
    const control = this.formularioPaso1.get('remitente_area');
    if (control?.touched && control?.errors) {
      if (control.errors['maxlength']) return 'Máximo 20 caracteres';
    }
    return null;
  }

  // Método para obtener opciones de meses
  get mesesOptions() {
    return this.meses.map(m => ({ value: m.value, label: m.nombre }));
  }
}
