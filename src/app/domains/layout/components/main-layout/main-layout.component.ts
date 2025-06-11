import { Component, TemplateRef, computed, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomSidenavComponent } from './custom-sidenav/custom-sidenav.component';
import { NavbarContentComponent } from './navbar-content/navbar-content.component';
import { NavbarContentInfoComponent } from './navbar-content/navbar-content-info/navbar-content-info.component';
import { RouterModule } from '@angular/router';
import { ModalService } from './../../../shared/services/modal.service';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { NotificationsComponent } from './notifications/notifications.component';
import { Oauth2Service } from '../../../services/ouath2.service';
import { Oauth2Code } from '../../../interfaces/oauth2.interfaces';
import { LoadAnimationComponent } from '../../../components/load-animation/load-animation.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatDialogModule,
    MatTooltipModule,
    CustomSidenavComponent,
    NavbarContentComponent,
    NavbarContentInfoComponent,
    LoadAnimationComponent,
    RouterModule,
    CommonModule,
    NotificationsComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {



  showErrorDialog = false;

  constructor(private oauth2Service: Oauth2Service, private modalService: ModalService) { }

  collapsed = signal(false);

  sidenavWidth = computed(() => (this.collapsed() ? '65px' : '270px'));

  openModal(template: TemplateRef<any>) {
    this.dialogRef = this.modalService.openCustomDialogWithTemplate({
      template
    });
  }


  ngOnInit(): void {
    this.getToken();
    this.modalService.showError.subscribe((show) => {
      this.showErrorDialog = show;
    });
  }


  private dialogRef: MatDialogRef<any> | null = null;

  isExpanded = true;
  showSubmenu: boolean = false;
  isShowing = false;
  showSubSubMenu: boolean = false;
  isLogged: boolean = false;
  public token: any;
  public isOpen = false;
  public user: any;
  public isExpandedUser = false;
  public isExpandedNotificacion = false;
  public isExpandedAyuda = false;
  public isExpandedConfig = false;
  public isExpandedBusqueda = false;
  public isExpandedCerrar = false;

  // Información del usuario para el modal
  nombreUsuario: string = '';
  puestoUsuario: string = '';
  rfcUsuario: string = '';
  correoUsuario: string = '';
  numeroAdministracion: string = '';
  numeroEmpleado: string = '';
  fechaRegistro: string = '';
  rolUsuario: string = '';

  // Contador de notificaciones
  contadorNotificaciones: number = 0;

   closeModal() {
    this.modalService.closeAllDialogs();
  }

  getToken(): void {
    let parts = window.location.href.split('&');
    let oauth2Code: Oauth2Code = { code: '', scope: '' };
    parts.forEach((part) => {
      let keyValue = part.split('=');
      if (
        keyValue.length === 2 &&
        keyValue[0].substring(keyValue[0].length - 4) == 'code'
      ) {
        oauth2Code.code = decodeURIComponent(keyValue[1]);
      } else if (keyValue.length === 2 && keyValue[0] == 'scope') {
        oauth2Code.scope = keyValue[1];
      }
    });
    if (oauth2Code.code !== "" && oauth2Code.code !== null && oauth2Code.code !== undefined) this.oauth2Service.getToken(oauth2Code);
  }
}


