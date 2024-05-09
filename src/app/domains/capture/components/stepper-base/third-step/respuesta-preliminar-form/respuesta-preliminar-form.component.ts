import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, 
  FormGroup, 
  Validators, 
  ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { FormComponent } from '../preliminar-form/form/form.component';
import { CollectFormInfoService } from '../../../../../shared/services/collect-form-info.service';


@Component({
  selector: 'app-respuesta-preliminar-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    CommonModule,
    MatIconModule,
    FormComponent,
  ],
  templateUrl: './respuesta-preliminar-form.component.html',
  styleUrl: './respuesta-preliminar-form.component.css'
})
export class RespuestaPreliminarFormComponent {

  constructor(
    private fb: FormBuilder,
    private collectFormInfoService: CollectFormInfoService,
  ){ }

  public respuestaPreliminarForm: FormGroup = this.fb.group({
    oficio: ['', [Validators.required, Validators.maxLength(255)]],
    carpetaInvestigacion: [null, [Validators.maxLength(255)]],
    folioInterno: ['', [Validators.required, Validators.maxLength(255)]],
    folioScanner: ['', [Validators.required, Validators.maxLength(255)]],
  });

  savePreliminarRespuestaForm(): void {
    console.log(this.respuestaPreliminarForm.value);
    this.collectFormInfoService.updatePreliminarEuacapeForm(
      this.respuestaPreliminarForm.value.oficio,
      this.respuestaPreliminarForm.value.carpetaInvestigacion,
      this.respuestaPreliminarForm.value.folioScanner,
    );
    this.collectFormInfoService.updateFolioInterno(
      this.respuestaPreliminarForm.value.folioInterno,
    );
  }



}
