import { Component, Input, computed, signal } from '@angular/core';
import { MenuItem } from '../../../models/menu-items.model';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-custom-sidenav',
  standalone: true,
  imports: [
    MatListModule,
    MatIconModule,
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
      label: 'Dashboard',
      route: 'dashboard',
    },
    {
      icon: 'video_library',
      label: 'Content',
      route: 'content',
    },
    {
      icon: 'analytics',
      label: 'Analytics',
      route: 'analytics',
    },
    {
      icon: 'comment',
      label: 'Comments',
      route: 'comments',
    },
  ]); 

  profilePicSize = computed(() => this.collapsed ? '32' : '100');

}
