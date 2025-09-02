import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogoutService {
  constructor() {}    
  logout() {
    // Preservar claves funcionales antes de limpiar
    const aprobados = localStorage.getItem('akamba_asuntos_aprobados');
    const enviados = localStorage.getItem('akamba_asuntos_enviados');

    localStorage.clear();

    if (aprobados) {
      localStorage.setItem('akamba_asuntos_aprobados', aprobados);
    }
    if (enviados) {
      localStorage.setItem('akamba_asuntos_enviados', enviados);
    }
    window.location.href = environment.logoutUrl;
  }     
}



