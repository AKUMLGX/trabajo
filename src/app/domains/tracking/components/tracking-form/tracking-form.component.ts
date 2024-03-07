import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AsuntoService } from '../../../services/asunto.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-tracking-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatIcon],
  templateUrl: './tracking-form.component.html',
  styleUrl: './tracking-form.component.css',
})
export class TrackingFormComponent {
  public consultForm: FormGroup = this.fb.group({
    folioInterno: new FormControl(''),
    carpetaInvertigacion: new FormControl(''),
    oficio: new FormControl(''),
    autoridadRemitente: new FormControl(''),
    personaRelacionada: new FormControl(''),
    tipoBusqueda: new FormControl('Nuevos')
  });

  constructor(
    private fb: FormBuilder,
    private asuntoService: AsuntoService
  ) { }

  onSave(): void {
    this.asuntoService.filterDocuments(this.consultForm);
  }
}
