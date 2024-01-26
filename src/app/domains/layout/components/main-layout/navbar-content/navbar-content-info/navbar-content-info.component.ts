import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-navbar-content-info',
  standalone: true,
  imports: [],
  templateUrl: './navbar-content-info.component.html',
  styleUrl: './navbar-content-info.component.css'
})
export class NavbarContentInfoComponent {
  path: string = '';
  dashboard: string = 'Dashboard';
  routerEvents: any;
  constructor(private router: Router) { 
    this.routerEvents = this.router.events.subscribe(
      (event:any)=>{
        if(event instanceof NavigationEnd){
          this.path = event.url;
          if(this.path === '/layout/dashboard'){
            this.path = 'Tablero';
          } else if(this.path === '/layout/content') {
            this.path = 'Contenido';
          } else if(this.path === '/layout/analytics') {
            this.path = 'Analítica';
          } else if(this.path === '/layout/comments') {
            this.path = 'Comentarios'
          }
        }
      }
    )
  }
  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.routerEvents.unsubscribe();
    // Unsubscribe to avoid memory leak
  }
}
