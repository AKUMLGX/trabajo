import { ChangeDetectorRef, Component, Input, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { FormComponent } from './form/form.component';
import { CollectFormInfoService } from '../../../../../shared/services/collect-form-info.service';
import { ModalService } from '../../../../../shared/services/modal.service';
import { AsuntoService } from '../../../../../services/asunto.service';
import { Asunto } from '../../../../../interfaces/asuntos.interfaces';
import { MatDialogModule } from '@angular/material/dialog';
import { CollectCarpetaStatusService } from '../../../../../shared/collect-carpeta-status.service';
@Component({
  selector: 'app-preliminar-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    CommonModule,
    MatIconModule,
    FormComponent,
    MatDialogModule,

  ],
  templateUrl: './preliminar-form.component.html',
  styleUrl: './preliminar-form.component.css'
})
export class PreliminarFormComponent {

  constructor(
    private fb: FormBuilder,
    private collectFormInfoService: CollectFormInfoService,
    private asuntoService: AsuntoService,
    private modalService: ModalService,
    private collectCarpetaStatusService: CollectCarpetaStatusService,
    public stepper: MatStepper,
    private cdRef: ChangeDetectorRef
  ) { }

  public preliminarForm: FormGroup = this.fb.group({
    oficio: ['', [Validators.required, Validators.maxLength(255)]],
    carpetaInvestigacion: [null, [Validators.maxLength(255)]],
    folioScanner: ['', [Validators.required, Validators.maxLength(255)]],
  });

  isPreliminarEuacapeFormValid = !this.preliminarForm.valid;

  // @Input() stepper!: MatStepper

  @Input() tipo: string = "";

  carpetaResultList: Asunto[] = []

  canProceed: boolean = false

  isCarpetaNull: boolean = true


  openCustomModalWithTemplate(template: TemplateRef<any>) {
    if (this.tipo == "EUACAPES") {
      if (this.preliminarForm.value.carpetaInvestigacion !== null) {
        this.isCarpetaNull = false;
        this.collectCarpetaStatusService.valideteIfCarpetaIsNull(this.isCarpetaNull);
      } else {
        this.isCarpetaNull = true;
        this.collectCarpetaStatusService.valideteIfCarpetaIsNull(this.isCarpetaNull)
      }
      this.asuntoService.checkNameCarpetaInvestigacion(
        this.preliminarForm
      ).subscribe((res) => {
        this.carpetaResultList = res
        if (this.carpetaResultList.length > 0) {
          this.modalService.openCustomDialogWithTemplate({
            template
          })
        }
        else if (this.carpetaResultList.length === 0) {
          this.canProceed = true;
          this.collectCarpetaStatusService.upadateCarpetaStatus(this.canProceed);
          this.nextStep(this.stepper);
        }
      })
    } else {
      this.canProceed = true;
      this.collectCarpetaStatusService.upadateCarpetaStatus(this.canProceed);
    }
  }

  nextStep(stepper: MatStepper) {
    this.cdRef.detectChanges();
    stepper.next();
  }
  savePreliminarEuacapeForm(): void {
    this.collectFormInfoService.updatePreliminarEuacapeForm(
      this.preliminarForm.value.oficio,
      this.preliminarForm.value.carpetaInvestigacion,
      this.preliminarForm.value.folioScanner
    );
  }
}
