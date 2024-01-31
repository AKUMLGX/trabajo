import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-tracking-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './tracking-form.component.html',
  styleUrl: './tracking-form.component.css'
})
export class TrackingFormComponent {

  public consultForm: FormGroup = this.fb.group({
    folioInterno: [''],
    carpetaInvertigacion: [''],
    oficio: [''],
    autoridadRemitente: [''],
    personaRelaciona: [''],
  });

  constructor(private fb: FormBuilder) { }

  onSave():void {
  }
}
