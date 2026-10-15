import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { Oauth2Service } from '../../../services/ouath2.service';
import { environment } from '../../../../../environments/environment';
import { UserService } from '../../../services/user.service';
import { EspecialistaSesion } from '../../../interfaces/oauth2.interfaces';
import { ROLES_TLALCALLI, ROL_CAPTURA, ROL_ESPECIALISTA, RolTlalcalli, TOKEN_SESION_LOCAL, rutaInicialDeRoles } from '../../config/roles.config';
import { SelectorEspecialistaLocalComponent } from '../../components/selector-especialista-local/selector-especialista-local.component';

const CLAVE_ROL_LOCAL = 'tlalcalli.rolLocal';
const CLAVE_ESPECIALISTA_LOCAL = 'tlalcalli.especialistaLocal';

@Component({
    selector: 'app-login-page',
    imports: [SelectorEspecialistaLocalComponent],
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.css'
})
export class LoginPageComponent {

  public environment = environment;

  /** true = entrada local con selector de rol; el back con DISABLE_AUTH acepta MOCK_ACCESS_TOKEN. */
  readonly modoLocal = environment.devOAuthBypass;
  readonly roles = ROLES_TLALCALLI;
  readonly rolSeleccionado = signal<RolTlalcalli>(this.rolGuardado());
  readonly especialistaSeleccionado = signal<EspecialistaSesion | null>(this.especialistaGuardado());

  readonly esRolEspecialista = computed(() => this.rolSeleccionado() === ROL_ESPECIALISTA);
  /** En local, el rol especialista necesita saber qué especialista es para filtrar sus asuntos. */
  readonly puedeEntrar = computed(() => !this.modoLocal || !this.esRolEspecialista() || !!this.especialistaSeleccionado());

  constructor(
    private oauth2Service: Oauth2Service,
    private router: Router,
    private userService: UserService
  ) {}

  seleccionarRol(rol: RolTlalcalli): void {
    this.rolSeleccionado.set(rol);
  }

  seleccionarEspecialista(especialista: EspecialistaSesion | null): void {
    this.especialistaSeleccionado.set(especialista);
  }

  login(): void {
    if (this.modoLocal) {
      this.loginLocal();
    } else {
      this.oauth2Service.do_oauth();
    }
  }

  /** Simula la respuesta de `login/token_validation` con un solo rol, como lo emitiría el IdP. */
  private loginLocal(): void {
    if (!this.puedeEntrar()) return;
    const rol = this.rolSeleccionado();
    const especialista = this.esRolEspecialista() ? this.especialistaSeleccionado() : null;
    localStorage.setItem(CLAVE_ROL_LOCAL, rol);
    if (especialista) {
      localStorage.setItem(CLAVE_ESPECIALISTA_LOCAL, JSON.stringify(especialista));
    }

    const ahora = Math.floor(Date.now() / 1000);
    const sessionInfo = {
      rfc: 'DEMO000000XXX',
      nombre: especialista ? `${especialista.nombre} (prueba local)` : 'Usuario de prueba local',
      roles: rol,
      token: TOKEN_SESION_LOCAL,
      exp: ahora + 24 * 60 * 60,
      especialista,
    };

    localStorage.setItem('sessionInfo', JSON.stringify(sessionInfo));
    this.userService.actualizarUsuario();

    this.userService
      .isAuthenticated$()
      .pipe(filter(Boolean), take(1))
      .subscribe(() => {
        void this.router.navigate([rutaInicialDeRoles([rol])]);
      });
  }

  private rolGuardado(): RolTlalcalli {
    const guardado = localStorage.getItem(CLAVE_ROL_LOCAL);
    return ROLES_TLALCALLI.find((r) => r.id === guardado)?.id ?? ROL_CAPTURA;
  }

  private especialistaGuardado(): EspecialistaSesion | null {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE_ESPECIALISTA_LOCAL) ?? 'null');
      return guardado?.nombre && Array.isArray(guardado.ids) ? guardado : null;
    } catch {
      return null;
    }
  }
}
