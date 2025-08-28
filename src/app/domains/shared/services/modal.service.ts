import { Component, EventEmitter, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CustomModalComponent } from '../components/custom-modal/custom-modal.component';
import { ModalData } from '../models/modal-data.model';
import { TemplateModalData } from '../models/template-modal-data.model';
import { CustomModalWithTemplateComponent } from '../components/custom-modal-with-template/custom-modal-with-template.component';


@Injectable({
  providedIn: 'root'
})
export class ModalService {

  showError = new EventEmitter<boolean>();

  constructor(private matDialog: MatDialog) { }
  

  openCustomDialog(data: ModalData){
    return this.matDialog.open(CustomModalComponent, {data})
  }
  
  openCustomDialogWithTemplate(data: TemplateModalData){
    return this.matDialog.open(
      CustomModalWithTemplateComponent, {data, disableClose: false}
    )
  }

  closeAllDialogs() {
    this.matDialog.closeAll();
  }
}
