import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';

@Component({
  selector: 'app-successful-dialog',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './successful-dialog.component.html',
  styleUrl: './successful-dialog.component.css'
})
export class SuccessfulDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA)public data:any){}
}
