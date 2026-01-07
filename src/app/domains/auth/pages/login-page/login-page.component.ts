import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Oauth2Service } from '../../../services/ouath2.service';
import { environment } from '../../../../../environments/environment';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {

  public environment = environment;
  
  // ⚠️ MODO DESARROLLO: Cambiar a true solo para pruebas locales
  private modoDesarrollo = false;

  constructor(
    private oauth2Service: Oauth2Service,
    private router: Router,
    private userService: UserService
  ) {}

  login(): void {
    if (this.modoDesarrollo) {
      this.loginDesarrollo();
    } else {
      this.oauth2Service.do_oauth();
    }
  }

  // Login de desarrollo sin OAuth
  private loginDesarrollo(): void {
    // Crear un JWT falso pero válido en estructura
    // El token expira en 24 horas
    const ahora = Math.floor(Date.now() / 1000);
    const expiracion = ahora + (24 * 60 * 60); // 24 horas
    
    // Estructura SessionInfo que espera el UserService
    const sessionInfo = {
      rfc: 'DEVL900101XXX',
      nombre: 'Usuario Desarrollo',
      roles: 'SIAT_AKAMBA_001_CAPTURA,SIAT_AKAMBA_002_SUPERVISA,SIAT_AKAMBA_003_ADMIN',
      // Token fake pero funcional para desarrollo
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXYtdXNlci0wMDEiLCJuYW1lIjoiVXN1YXJpbyBEZXNhcnJvbGxvIiwicmZjIjoiREVWTDkwMDEwMVhYWCIsInJvbGVzIjoiU0lBVF9BS0FNQkFfMDAxX0NBUFRVUkEsU0lBVF9BS0FNQkFfMDAyX1NVUEVSVKLSU0EsU0lBVF9BS0FNQkFfMDAzX0FETUlOIiwiaWF0IjoxNzA0MDY3MjAwLCJleHAiOjE3MzU2ODk2MDB9.fake-signature-for-dev',
      exp: expiracion
    };

    // Guardar en localStorage con la misma estructura que usa el OAuth
    localStorage.setItem('sessionInfo', JSON.stringify(sessionInfo));

    // Actualizar el UserService
    this.userService.actualizarUsuario();

    // Redirigir a la bandeja de captura
    this.router.navigate(['/layout/capture']);
  }
}
