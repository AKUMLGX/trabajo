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
          if(this.path === '/layout/capture'){
            this.path = 'Bandeja de captura';
          } else if(this.path === '/layout/consult') {
            this.path = 'Bandeja de consulta';
          } else if(this.path === '/layout/tracking') {
            this.path = 'Bandeja de seguimiento';
          } else if(this.path === '/layout/reports') {
            this.path = 'Bandeja de reportes'
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
