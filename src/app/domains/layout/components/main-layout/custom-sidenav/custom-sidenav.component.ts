import { Component, Input, computed, signal } from '@angular/core';
import { MenuItem } from '../../../models/menu-items.model';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-custom-sidenav',
  standalone: true,
  imports: [
    MatListModule,
    MatIconModule,
    RouterLink,
    RouterModule
  ],
  templateUrl: './custom-sidenav.component.html',
  styleUrl: './custom-sidenav.component.css'
})
export class CustomSidenavComponent {

  // sideNavCollapsed = signal(false);
  // @Input() set collapsed(val: boolean) {
  //   this.sideNavCollapsed.set(val);
  // }
  @Input() collapsed: boolean = false;

  menuItems = signal<MenuItem[]>([
    {
      icon: 'dvr',
      label: 'Bandeja de captura',
      route: '/layout/capture',
    },
    {
      icon: 'dashboard',
      label: 'Bandeja de atención',
      route: '/layout/assistance',
    },
    {
      icon: 'analytics',
      label: 'Bandeja de seguimiento',
      route: '/layout/tracking',
    },
    {
      icon: 'folder',
      label: 'Bandeja de reportes',
      route: '/layout/reports',
    },
  ]); 

  profilePicSize = computed(() => this.collapsed ? '10' : '100');

}
