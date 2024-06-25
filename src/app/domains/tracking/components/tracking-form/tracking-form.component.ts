import { trigger, style, transition, animate } from '@angular/animations';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Component  ,ElementRef,ViewChild} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatIcon } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { dynamicHeight } from '../../../shared/animacion/dynamicHeight.trigger';
import { AsuntoService } from '../../../services/asunto.service';
@Component({
  selector: 'app-tracking-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatIcon, MatListModule, CommonModule],
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
  @ViewChild('InputFormulario') InputFormulario!: ElementRef<HTMLButtonElement>;
  showCoincidencias: { [key: string]: boolean } = {};
  campoValor: { [key: string]: any } = {};
  campos:string[]=["persona_relacionada","autoridad_remitente","folio_interno"]
  constructor(
    private fb: FormBuilder,
    private asuntoService: AsuntoService,
    private router: Router
    ) {    this.campoValor = {
      folioInterno: '',
      carpetaInvertigacion: '',
      oficio: '',
      autoridadRemitente: '',
      personaRelacionada: '',
      volante_jefatura: ''
    };}
    
  
    coincidencias: string[] = [];
    nombre_campo_input:string="";
    mostrar_coincidencias?:boolean;
  

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
     this.coincidencias=[];
     this.nombre_campo_input = document.activeElement?.getAttribute('formControlName') ??'';
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
   
     this.coincidencias = coincidencias.slice(0,5);
    });
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
}
