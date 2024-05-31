import { Component, EventEmitter, Output, TemplateRef } from '@angular/core';
import { DropdownComponent } from './dropdown/dropdown.component';
import { MatStepperModule } from '@angular/material/stepper';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../../shared/services/modal.service';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-second-step',
  standalone: true,
  imports: [
    DropdownComponent,
    MatStepperModule,
    CommonModule,
    MatDialogModule,
  ],
  templateUrl: './second-step.component.html',
  styleUrl: './second-step.component.css'
})
export class SecondStepComponent {

  constructor(
    private modalService: ModalService,
  ) { }

  selectedOption: any;

  enabledButton: boolean = false;

  isSecondStepPressed: boolean = false;

  @Output() selectedOptionEmitter = new EventEmitter();

  retrieveSelectionFromDropdown(event: any) {
    this.selectedOption = event;
    if (this.selectedOption !== undefined) {
      this.enabledButton = true;
    } else {
      this.enabledButton = false;
    }
    return this.enabledButton;
  }

  proceedToStepThreeHandler() {
  }

  openCustomModalWithTemplate(template: TemplateRef<any>) {
    this.modalService.openCustomDialogWithTemplate({
      template
    });
    this.isSecondStepPressed = true;
    this.selectedOptionEmitter.emit(this.selectedOption.name);
  }

  modalCancelButton() {
    this.isSecondStepPressed = false;
  }





}
