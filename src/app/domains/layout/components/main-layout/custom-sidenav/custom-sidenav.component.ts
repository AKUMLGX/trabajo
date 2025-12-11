import { Component, Input, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from '../../../models/menu-items.model';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterModule } from '@angular/router';
import { LogoutService } from '../../../../services/logout.service';
import { environment } from '../../../../../../environments/environment';
import { DatePipe } from '@angular/common';
import { PermissionsService } from '../../../../services/permissions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-custom-sidenav',
  standalone: true,
  imports: [MatListModule, MatIconModule, RouterLink, RouterModule],
  templateUrl: './custom-sidenav.component.html',
  styleUrl: './custom-sidenav.component.css',
})
export class CustomSidenavComponent implements OnInit, OnDestroy {
  // sideNavCollapsed = signal(false);
  // @Input() set collapsed(val: boolean) {
  //   this.sideNavCollapsed.set(val);
  // }

  constructor(
    private logoutService: LogoutService,
    private permissionsService: PermissionsService
  ) {}
  
  @Input() collapsed = false;

  public environment = environment;

  // Menú dinámico basado en permisos
  menuItems = signal<MenuItem[]>([]);
  
  private subscription: Subscription = new Subscription();

  ngOnInit() {
    this.cargarMenuConPermisos();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Carga el menú dinámicamente basado en los permisos del usuario
   */
  private cargarMenuConPermisos(): void {
    this.subscription.add(
      this.permissionsService.getUserPermissions().subscribe(permissions => {
        const menuItems: MenuItem[] = [];

        // Solo agregar bandejas a las que el usuario tiene acceso
        if (permissions.captura) {
          menuItems.push({
            icon: 'dvr',
            label: 'Bandeja de captura',
            route: '/layout/capture',
          });
        }

        if (permissions.atencion) {
          menuItems.push({
            icon: 'dashboard',
            label: 'Bandeja de atención',
            route: '/layout/assistance',
          });
        }

        if (permissions.dictaminador) {
          menuItems.push({
            icon: 'gavel',
            label: 'Bandeja de dictaminador',
            route: '/layout/dictaminador',
          });
        }

        if (permissions.seguimiento) {
          menuItems.push({
            icon: 'analytics',
            label: 'Bandeja de seguimiento',
            route: '/layout/tracking',
          });
        }

        if (permissions.reportes) {
          menuItems.push({
            icon: 'folder',
            label: 'Bandeja de reportes',
            route: '/layout/reports',
          });
        }

        // Centro de Control de Expedientes - Disponible para todos los usuarios autenticados
        // El backend filtra automáticamente por el responsable del JWT
        // Incluye el semáforo de atención (72h desde captura)
        menuItems.push({
          icon: 'pending_actions',
          label: 'Centro de Control',
          route: '/layout/responsables',
        });

        // Dashboard de Estadísticas - Vista ejecutiva para administradores
        menuItems.push({
          icon: 'insights',
          label: 'Panel Estadístico',
          route: '/layout/dashboard',
        });

        // Si no hay bandejas disponibles, mostrar mensaje
        if (menuItems.length === 0) {
          menuItems.push({
            icon: 'warning',
            label: 'No tienes bandejas disponibles',
            route: '/layout',
          });
        }

        this.menuItems.set(menuItems);
      })
    );
  }

  profilePicSize = computed(() => (this.collapsed ? '10' : '100'));

  logout() {
    this.logoutService.logout();
  }

  pipe = new DatePipe('en-US');

  date = this.pipe.transform(new Date(), 'YYYY');

  commit_sha = `${environment.hash}`.substring(0,8)

  envrionment =  `${environment.environment}`

}
