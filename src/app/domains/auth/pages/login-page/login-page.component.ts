import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs/operators';
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

  /**
   * true = un solo clic en "Iniciar sesión", sin OAuth/IdP.
   * El backend con DISABLE_AUTH reconoce MOCK_ACCESS_TOKEN y no llama al IdP.
   */
  private modoDesarrollo = true;

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

  /** Sesión local demo: todos los roles Akamba para que el menú y permisos reflejen todas las bandejas. */
  private loginDesarrollo(): void {
    const ahora = Math.floor(Date.now() / 1000);
    const expiracion = ahora + 24 * 60 * 60;

    const sessionInfo = {
      rfc: 'DEMO000000XXX',
      nombre: 'Usuario demostración',
      roles: [
        'SIAT_AKAMBA_001_CAPTURA',
        'SIAT_AKAMBA_002_SUPERVISA',
        'SIAT_AKAMBA_003_SUPERVISA_ATENCION',
        'SIAT_AKAMBA_004_CAPTURA_ATENCION',
      ].join(','),
      token: 'MOCK_ACCESS_TOKEN',
      exp: expiracion,
    };

    localStorage.setItem('sessionInfo', JSON.stringify(sessionInfo));
    this.userService.actualizarUsuario();

    this.userService
      .isAuthenticated$()
      .pipe(filter(Boolean), take(1))
      .subscribe(() => {
        void this.router.navigate(['/layout/capture']);
      });
  }
}
