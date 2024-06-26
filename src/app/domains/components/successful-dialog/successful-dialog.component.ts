import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-successful-dialog',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './successful-dialog.component.html',
  styleUrl: './successful-dialog.component.css'
})
export class SuccessfulDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private router: Router) { }

  navigate() {
    window.location.href = environment.layoutUrl
    this.router.navigate(["/capture"])
  }
}
