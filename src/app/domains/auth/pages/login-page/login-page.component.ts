import { Component } from '@angular/core';
import { Oauth2Service } from '../../../services/ouath2.service';
import { UserService } from '../../../services/user.service';
import { environment } from '../../../../../environments/environment';
import { SessionInfo } from '../../../interfaces/oauth2.interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {

  public environment = environment;

  constructor(
    private oauth2Service: Oauth2Service,
    private userService: UserService,
    private router: Router
  ) {}

  login():void {
    // ============================================
    // 🏠 MODO DESARROLLO - LOGIN SIN OAUTH
    // Comentar esta sección cuando regreses a la oficina
    // ============================================
    this.loginDesarrollo();
    return;
    // ============================================
    // 🔐 MODO PRODUCCIÓN - OAUTH REAL
    // Descomentar cuando regreses a la oficina
    // ============================================
    // this.oauth2Service.do_oauth();
  }

  /**
   * Método temporal para desarrollo sin internet
   * Crea una sesión mock sin necesidad de OAuth
   */
  private loginDesarrollo(): void {
    console.log('🏠 [MODO DESARROLLO] Iniciando sesión sin OAuth...');
    
    // Crear sesión mock con datos de prueba
    const sessionInfoMock: SessionInfo = {
      rfc: 'MOCK_USER',
      nombre: 'Usuario de Prueba Local',
      roles: 'SIAT_AKAMBA_001_CAPTURA,SIAT_AKAMBA_002_SUPERVISA,SIAT_AKAMBA_003_SUPERVISA_ATENCION,SIAT_AKAMBA_004_CAPTURA_ATENCION',
      token: 'MOCK_ACCESS_TOKEN_' + Date.now(),
      exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60) // Expira en 4 horas
    };

    // Guardar en localStorage (igual que lo hace OAuth)
    localStorage.setItem('sessionInfo', JSON.stringify(sessionInfoMock));
    
    // Notificar al UserService que actualice la información
    this.userService.actualizarUsuario();
    
    console.log('✅ [MODO DESARROLLO] Sesión mock creada exitosamente');
    
    // Redirigir a la página principal después de un pequeño delay
    // para asegurar que el UserService actualice la información
    setTimeout(() => {
      this.router.navigate(['/layout/capture']);
    }, 100);
  }

}
