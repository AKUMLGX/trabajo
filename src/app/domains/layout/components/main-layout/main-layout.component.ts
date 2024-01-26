import { Component, computed, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule  } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CustomSidenavComponent } from './custom-sidenav/custom-sidenav.component';
import { NavbarContentComponent } from './navbar-content/navbar-content.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    CustomSidenavComponent,
    NavbarContentComponent, 
    RouterModule, 
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

  collapsed = signal(false);

  sidenavWidth = computed(() => this.collapsed() ? '65px' : '270px');

}
