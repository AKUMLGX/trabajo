import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { LogoutService } from '../../services/logout.service';

@Component({
    selector: 'app-error-dialog',
    imports: [MatDialogModule],
    templateUrl: './error-dialog.component.html',
    styleUrl: './error-dialog.component.css'
})
export class ErrorDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private logoutService: LogoutService) { }

  callBack() {
    if (this.data.func == "logout") {
      this.logoutService.logout();
    }
  }

}
