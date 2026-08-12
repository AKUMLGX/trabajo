import { Component } from '@angular/core';
import { MatIconModule  } from '@angular/material/icon';
import { environment } from '../../../../../../environments/environment';

@Component({
    selector: 'app-navbar-content',
    imports: [MatIconModule],
    templateUrl: './navbar-content.component.html',
    styleUrl: './navbar-content.component.css'
})
export class NavbarContentComponent {

  public environment = environment;

}
