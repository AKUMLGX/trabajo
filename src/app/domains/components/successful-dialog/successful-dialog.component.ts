import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-successful-dialog',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './successful-dialog.component.html',
  styleUrl: './successful-dialog.component.css'
})
export class SuccessfulDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA)public data:any, private router:Router){}

  navigete(){
  this.router.navigate(["layout/capture"])
  }
}
