import { Component, TemplateRef, computed, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CustomSidenavComponent } from './custom-sidenav/custom-sidenav.component';
import { NavbarContentComponent } from './navbar-content/navbar-content.component';
import { NavbarContentInfoComponent } from './navbar-content/navbar-content-info/navbar-content-info.component';
import { RouterModule } from '@angular/router';
import { ModalService } from './../../../shared/services/modal.service';
import { MatDialogModule } from '@angular/material/dialog';
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
    CustomSidenavComponent,
    NavbarContentComponent,
    NavbarContentInfoComponent,
    RouterModule,
    CommonModule,
    NotificationsComponent,
    LoadAnimationComponent,

  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {
  constructor(private oauth2Service: Oauth2Service, private modalService:ModalService) {}


  collapsed = signal(false);

  sidenavWidth = computed(() => (this.collapsed() ? '65px' : '270px'));

  openModal(template:TemplateRef<any>){
   this.modalService.openCustomDialogWithTemplate({
    template
   })
  }


  ngOnInit(): void {
    this.getToken();
  }

  getToken(): void {
    if (!this.checkTokenExist()) {
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
      this.oauth2Service.getToken(oauth2Code);
    }
  }

  //Está función no es necesaria, solo es para que al desarrollar no nos saque cada vez que actualizamos
  //el código.
  checkTokenExist() {
    let sessionInfo = localStorage.getItem('sessionInfo');
    if (sessionInfo !== null) {
      let parse = JSON.parse(sessionInfo);
      let expiryDate = new Date(parse.exp * 1000);
      let currentDate = new Date(Date.now());
      if (expiryDate > currentDate) {
        return true;
      }
    }
    return false;
  }
}


