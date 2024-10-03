import { trigger, style, transition, animate } from '@angular/animations';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { dynamicHeight } from '../../../shared/animacion/dynamicHeight.trigger';
import { AsuntoService } from '../../../services/asunto.service';

import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
@Component({
  selector: 'app-tracking-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatIcon, MatListModule, CommonModule,MatInputModule,MatFormFieldModule,FormsModule,MatDialogModule],
  templateUrl: './tracking-form.component.html',
  styleUrl: './tracking-form.component.css',
  animations: [
    dynamicHeight,
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.35)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'scale(0.35)' })),
      ]),
    ]),
  ],
})
export class TrackingFormComponent {
  public consultForm: FormGroup = this.fb.group({
    folioInterno: new FormControl(''),
    carpetaInvertigacion: new FormControl(''),
    oficio: new FormControl(''),
    autoridadRemitente: new FormControl(''),
    personaRelacionada: new FormControl(''),
    volante_jefatura: new FormControl(''),
    tipoBusqueda: new FormControl('Nuevos')
  });

  public fecha = new FormControl('');
  public administracion = new FormControl('');
  public formato = new FormControl('pdf');

  public fechaActual = '2018-11-11';

  selecionarOpcion:string=''

  @ViewChild('InputFormulario') InputFormulario!: ElementRef<HTMLButtonElement>;
  showCoincidencias: { [key: string]: boolean } = {};
  campoValor: { [key: string]: any } = {};
  campos: string[] = ["persona_relacionada", "autoridad_remitente", "folio_interno"]
  constructor(
    private fb: FormBuilder,
    private asuntoService: AsuntoService,
  ) {
    this.campoValor = {
      folioInterno: '',
      carpetaInvertigacion: '',
      oficio: '',
      autoridadRemitente: '',
      personaRelacionada: '',
      volante_jefatura: ''
    };
    let date = new Date();
    let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    let month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
    let day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
    this.fechaActual = `${year}-${month}-${day}`;
    this.fecha.setValue(this.fechaActual);
  }
  coincidencias: string[] = [];
  nombre_campo_input: string = "";
  mostrar_coincidencias?: boolean;


  DetectInput(entering: boolean, campo: string): void {
    this.showCoincidencias[campo] = entering;
    if (!entering) {
      this.cleanCoincidencias();
    }
  }
  cleanCoincidencias(): void {
    this.coincidencias = [];
  }
  onSave(): void {
    this.asuntoService.filterDocuments(this.consultForm);
  }

  getValueInput(): void {
    this.coincidencias = [];
    this.nombre_campo_input = document.activeElement?.getAttribute('formControlName') ?? '';
    if (!this.nombre_campo_input || !this.consultForm.contains(this.nombre_campo_input)) {
      return;
    }
    const fomulario_control = this.consultForm.get(this.nombre_campo_input);
    if (!fomulario_control || fomulario_control.value === undefined) {
      return;
    }
    const valor_input = fomulario_control.value;
    if (this.nombre_campo_input === "carpetaInvertigacion") {
      this.nombre_campo_input = "carpetaInvestigacion";
    }
    this.asuntoService.searchBarCoincidencesIlike(valor_input, this.nombre_campo_input.replace(/([A-Z])/g, '_$1').toLowerCase()).subscribe((coincidencias: string[]) => {
      this.coincidencias = coincidencias.slice(0, 5);
    });
  }

  descargarAcuse(): void {
    if (this.fecha.value)
      this.asuntoService.generateAcuse(this.fecha.value, this.administracion.value, this.formato.value);
  }


  selectCoincidencia(coincidencia: string): void {
    const formControl = this.consultForm.get(this.nombre_campo_input);
    if (formControl) {
      formControl.setValue(coincidencia);
    } else {
      console.error(`Error: No se pudo encontrar el control del formulario para '${this.nombre_campo_input}'.`);
    }
    this.cleanCoincidencias();
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }


  onSelectedOption(event: Event){
    const target = event.target as HTMLSelectElement
    this.selecionarOpcion = target.value
}

}
