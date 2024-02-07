import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ModalData } from '../../models/modal-data.model';

@Component({
  selector: 'app-custom-modal',
  standalone: true,
  imports: [
    MatDialogModule,
  ],
  templateUrl: './custom-modal.component.html',
  styleUrl: './custom-modal.component.css'
})
export class CustomModalComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: ModalData ) {

  }

}
