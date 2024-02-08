import { Component } from '@angular/core';
import { MatIconModule  } from '@angular/material/icon';
import { LoadAnimationComponent } from '../../../../components/load-animation/load-animation.component';

@Component({
  selector: 'app-navbar-content',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './navbar-content.component.html',
  styleUrl: './navbar-content.component.css'
})
export class NavbarContentComponent {

}
