import { Component } from '@angular/core';
import { FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';
import { TipoRespuestaSelectComponent } from './tipo-respuesta-select/tipo-respuesta-select.component';

import { AtencionSelectComponent } from './atencion-select/atencion-select.component';
import { RespuestaSelectComponent } from './respuesta-select/respuesta-select.component';
import { AcuseSelectComponent } from './acuse-select/acuse-select.component';

@Component({
  selector: 'app-euacape-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    AtencionSelectComponent, 
    TipoRespuestaSelectComponent,
    RespuestaSelectComponent,
    AcuseSelectComponent,
  ],
  templateUrl: './euacape-form.component.html',
  styleUrl: './euacape-form.component.css'
})
export class EuacapeFormComponent {

  constructor(
    private fb: FormBuilder,
  ) {}

  public euacapeForm: FormGroup = this.fb.group({
    administracion: [''],
    fechaRecepcion: [''],
    documentosEscaneados: [''],
    descripcion: [''],
    autoridadSolicitante: [''],
    turnoJefatura: [''],
    folioInterno: [''],
    carpetaInvestigacion: [''],
    personaRelacionada: [''],
    folioScanner: [''],
    tipoAsunto: [''],
    plazoAtencion: [''],
  });

  onSave(): void {
    console.log("Hello world");
  }

}
