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
  moduleDescription: string = '';
  dashboard: string = 'Dashboard';
  routerEvents: any;
  constructor(private router: Router) { 
    this.routerEvents = this.router.events.subscribe(
      (event:any)=>{
        if(event instanceof NavigationEnd){
          this.path = event.url;
          if(this.path === '/layout/capture'){
            this.path = 'Bandeja de captura';
            this.moduleDescription = 'Funcionalidades para captura de asuntos';
          } else if(this.path === '/layout/assistance') {
            this.path = 'Bandeja de atención';
            this.moduleDescription = 'Funcionalidades para la atención de asuntos';
          } else if(this.path === '/layout/tracking') {
            this.path = 'Bandeja de seguimiento';
            this.moduleDescription = 'Funcionalidades para la consulta de las bandejas de captura y atención';
          } else if(this.path === '/layout/reports') {
            this.path = 'Bandeja de reportes';
            this.moduleDescription = 'Funcionalidades para la generación de estadísticos';
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
