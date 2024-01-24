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
      icon: 'dashboard',
      label: 'Tablero',
      route: '/layout/dashboard',
    },
    {
      icon: 'video_library',
      label: 'Contenido',
      route: '/layout/content',
    },
    {
      icon: 'analytics',
      label: 'Analítica',
      route: '/layout/analytics',
    },
    {
      icon: 'comment',
      label: 'Comentarios',
      route: '/layout/comments',
    },
  ]); 

  profilePicSize = computed(() => this.collapsed ? '32' : '100');

}
