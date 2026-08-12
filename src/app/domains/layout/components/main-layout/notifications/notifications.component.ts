import { Component, TemplateRef, computed, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule  } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';

import { PendientesPorAcusarComponent } from './pendientes-por-acusar/pendientes-por-acusar.component';
import { ValidadorDeRespuestasComponent } from './validador-de-respuestas/validador-de-respuestas.component';

@Component({
    selector: 'app-notifications',
    imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatDialogModule,
    RouterModule,
    PendientesPorAcusarComponent,
    ValidadorDeRespuestasComponent
],
    templateUrl: './notifications.component.html',
    styleUrl: './notifications.component.css'
})
export class NotificationsComponent {

  selecionarOpcion=''

  onSelectedOption(event: Event){
      const target = event.target as HTMLSelectElement
      this.selecionarOpcion = target.value
  }

}
