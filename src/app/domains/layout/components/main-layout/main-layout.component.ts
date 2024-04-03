import { Component, TemplateRef, computed, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule  } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CustomSidenavComponent } from './custom-sidenav/custom-sidenav.component';
import { NavbarContentComponent } from './navbar-content/navbar-content.component';
import { NavbarContentInfoComponent } from './navbar-content/navbar-content-info/navbar-content-info.component';
import { RouterModule } from '@angular/router';
import { ModalService } from './../../../shared/services/modal.service';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { PendientesAcusarComponent } from './navbar-content/select-pendientes-acusar/pendientes-acusar/pendientes-acusar.component';
import { NotificationsComponent } from './notifications/notifications.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatDialogModule,
    CustomSidenavComponent,
    NavbarContentComponent,
    NavbarContentInfoComponent,
    RouterModule,
    CommonModule,
    PendientesAcusarComponent,
    NotificationsComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

  constructor(private modalService:ModalService){}

  collapsed = signal(false);

  sidenavWidth = computed(() => this.collapsed() ? '65px' : '270px');

  openModal(template:TemplateRef<any>){
   this.modalService.openCustomDialogWithTemplate({
    template
   })
  }
  

}


