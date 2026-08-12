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
import { Oauth2Code, UsuarioCompleto } from '../../../interfaces/oauth2.interfaces';
//import { LoadAnimationComponent } from '../../../components/load-animation/load-animation.component';
import { UserService } from '../../../services/user.service';
import { UserProfileComponent } from '../../../components/user-profile/user-profile.component';
import { Subject, takeUntil } from 'rxjs';
import { PermissionsService } from '../../../services/permissions.service';

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
  usuarioActual: UsuarioCompleto | null = null;
  puedeVerRevisionFinal = false;

  constructor(
    private oauth2Service: Oauth2Service,
    private modalService: ModalService,
    private userService: UserService,
    private permissionsService: PermissionsService
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

    // Suscribirse a cambios en el usuario
    this.userService.getUsuario$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(usuario => {
        this.usuarioActual = usuario;
        this.actualizarInformacionUsuario(usuario);
      });

    // Determinar si el usuario puede ver "Revisión Final de Asuntos"
    this.permissionsService
      .canAccessBandeja('revisionFinal')
      .pipe(takeUntil(this.destroy$))
      .subscribe(can => (this.puedeVerRevisionFinal = !!can));
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

  // Información del usuario para el modal
  nombreUsuario = '';
  puestoUsuario = '';
  rfcUsuario = '';
  correoUsuario = '';
  numeroAdministracion = '';
  numeroEmpleado = '';
  fechaRegistro = '';
  rolUsuario = '';

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

  /**
   * Actualiza la información del usuario en las propiedades del modal
   */
  private actualizarInformacionUsuario(usuario: UsuarioCompleto | null): void {
    if (usuario) {
      this.nombreUsuario = usuario.nombre;
      this.rfcUsuario = usuario.rfc;
      this.rolUsuario = this.obtenerDescripcionRol(usuario);
      this.correoUsuario = `${usuario.rfc}@sat.gob.mx`; // Email corporativo basado en RFC
      this.numeroAdministracion = this.extraerAdministracion(usuario.roles);
      this.numeroEmpleado = usuario.rfc; // Usar RFC como número de empleado
      this.fechaRegistro = usuario.fechaEmision.toLocaleDateString('es-MX');
      this.puestoUsuario = this.obtenerDescripcionRol(usuario);
    } else {
      // Limpiar datos si no hay usuario
      this.nombreUsuario = '';
      this.rfcUsuario = '';
      this.rolUsuario = '';
      this.correoUsuario = '';
      this.numeroAdministracion = '';
      this.numeroEmpleado = '';
      this.fechaRegistro = '';
      this.puestoUsuario = '';
    }
  }

  /**
   * Obtiene una descripción amigable del rol del usuario
   */
  private obtenerDescripcionRol(usuario: UsuarioCompleto): string {
    if (usuario.esAdmin) return 'Administrador del Sistema';
    if (usuario.esSupervisorAtencion) return 'Supervisor de Atención';
    if (usuario.esSupervisor) return 'Supervisor';
    if (usuario.esCapturistaAtencion) return 'Capturista de Atención';
    if (usuario.esCapturista) return 'Capturista';
    return 'Usuario del Sistema';
  }

  /**
   * Extrae el número de administración de los roles
   */
  private extraerAdministracion(roles: string): string {
    // Buscar patrones como "001", "002", etc. en los roles
    const match = roles.match(/(\d{3})/);
    return match ? `Administración ${match[1]}` : 'No asignada';
  }
}


