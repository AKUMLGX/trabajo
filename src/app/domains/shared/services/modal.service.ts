import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CustomModalComponent } from '../components/custom-modal/custom-modal.component';
import { ModalData } from '../models/modal-data.model';


@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private matDialog: MatDialog) { }

  openCustomDialog(data: ModalData){
    this.matDialog.open(CustomModalComponent, {data})
  }

}
