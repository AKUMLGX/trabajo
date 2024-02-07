import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CustomModalComponent } from '../components/custom-modal/custom-modal.component';


@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private matDialog: MatDialog) { }

  openCustomDialog(){
    this.matDialog.open(CustomModalComponent)
  }

}
