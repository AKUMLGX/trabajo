import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AsuntoHistoricoService } from '../../../services/asuntoHistorico.service';

@Component({
  selector: 'app-tracking-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './tracking-form.component.html',
  styleUrl: './tracking-form.component.css',
})
export class TrackingFormComponent {
  public consultForm: FormGroup = this.fb.group({
    folioInterno: new FormControl(''),
    carpetaInvertigacion: new FormControl(''),
    oficio: new FormControl(''),
    autoridadRemitente: new FormControl(''),
    personaRelaciona: new FormControl(''),
    alcance: new FormControl('')
  });

  constructor(
    private fb: FormBuilder,
    private asuntoNuevoService: AsuntoHistoricoService
  ) { }

  onSave(): void {
    this.asuntoNuevoService.filterDocuments(this.consultForm);
  }
}
