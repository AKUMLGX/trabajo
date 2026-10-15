import { Component, TemplateRef, computed, signal, OnInit, OnDestroy } from '@angular/core';
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

import { NotificationsComponent } from './notifications/notifications.component';
import { Oauth2Service } from '../../../services/ouath2.service';
import { Oauth2Code } from '../../../interfaces/oauth2.interfaces';
//import { LoadAnimationComponent } from '../../../components/load-animation/load-animation.component';
import { UserProfileComponent } from '../../../components/user-profile/user-profile.component';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-main-layout',
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
    RouterModule,
    NotificationsComponent,
    UserProfileComponent
],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit, OnDestroy {



  showErrorDialog = false;

  private destroy$ = new Subject<void>();

  constructor(
    private oauth2Service: Oauth2Service,
    private modalService: ModalService
  ) { }

  collapsed = signal(false);
  showUserInfoModal = signal(false);

  sidenavWidth = computed(() => (this.collapsed() ? '65px' : '270px'));

  openModal(template: TemplateRef<any>) {
    this.dialogRef = this.modalService.openCustomDialogWithTemplate({
      template,
    });
  }


openUserInfoModal() {
  this.showUserInfoModal.set(true);
}

closeUserInfoModal() {
  this.showUserInfoModal.set(false);
}


  ngOnInit(): void {
    this.getToken();
    this.modalService.showError.subscribe((show) => {
      this.showErrorDialog = show;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private dialogRef: MatDialogRef<any> | null = null;

  isExpanded = true;
  showSubmenu = false;
  isShowing = false;
  showSubSubMenu = false;
  isLogged = false;
  public token: any;
  public isOpen = false;
  public user: any;
  public isExpandedUser = false;
  public isExpandedNotificacion = false;
  public isExpandedAyuda = false;
  public isExpandedConfig = false;
  public isExpandedBusqueda = false;
  public isExpandedCerrar = false;

  // Contador de notificaciones
  contadorNotificaciones = 0;

   closeModal() {
    this.modalService.closeAllDialogs();
  }

  getToken(): void {
    const parts = window.location.href.split('&');
    const oauth2Code: Oauth2Code = { code: '', scope: '' };
    parts.forEach((part) => {
      const keyValue = part.split('=');
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
