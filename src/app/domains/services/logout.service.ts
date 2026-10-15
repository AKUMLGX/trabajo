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
    const rolLocal = localStorage.getItem('tlalcalli.rolLocal');

    localStorage.clear();

    if (aprobados) {
      localStorage.setItem('akamba_asuntos_aprobados', aprobados);
    }
    if (enviados) {
      localStorage.setItem('akamba_asuntos_enviados', enviados);
    }
    if (rolLocal) {
      localStorage.setItem('tlalcalli.rolLocal', rolLocal);
    }

    // Sin IdP no hay sesión que cerrar en NetIQ: se vuelve al login de la app (respeta el base href).
    window.location.href = environment.devOAuthBypass ? `${document.baseURI}login` : environment.logoutUrl;
  }     
}
