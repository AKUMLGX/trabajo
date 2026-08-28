import { Component, Input, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from '../../../models/menu-items.model';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterModule } from '@angular/router';
import { LogoutService } from '../../../../services/logout.service';
import { environment } from '../../../../../../environments/environment';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { PermissionsService } from '../../../../services/permissions.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-custom-sidenav',
    imports: [MatListModule, MatIconModule, RouterLink, RouterModule, NgClass, CommonModule],
    templateUrl: './custom-sidenav.component.html',
    styleUrl: './custom-sidenav.component.css'
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

        // Captura y seguimiento: visibles para todos los usuarios autenticados (el layout ya exige login).
        // Antes dependían del mapa de roles y usuarios solo de Centro de Control no las veían.
        menuItems.push({
          icon: 'dvr',
          label: 'Captura',
          route: '/layout/capture',
        });
        menuItems.push({
          icon: 'analytics',
          label: 'Consulta',
          route: '/layout/tracking',
        });

        menuItems.push({
          icon: 'pending_actions',
          label: 'Centro de control',
          route: '/layout/responsables',
        });

        // Bandeja de Atención/Cierre - Última parte del flujo
        menuItems.push({
          icon: 'check_circle',
          label: 'Atención / cierre',
          route: '/layout/atencion-cierre',
        });

        // Dashboard de Estadísticas - Vista ejecutiva para administradores
        menuItems.push({
          icon: 'insights',
          label: 'Panel Estadístico',
          route: '/layout/dashboard',
        });

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
