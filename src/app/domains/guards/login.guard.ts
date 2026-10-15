import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { TOKEN_SESION_LOCAL, esRolTlalcalli } from '../auth/config/roles.config';
import { UserService } from '../services/user.service';

/** Exige sesión para el layout; deja pasar el regreso del IdP (`?code=`) para que el layout canjee el código. */
export const loginGuard = (route: ActivatedRouteSnapshot) => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (route.queryParamMap.has('code')) {
    return true;
  }
  if (!userService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  // Sesiones de prueba anteriores al selector de rol (roles Akamba): se vuelve a elegir rol.
  const sesionMockSinRol =
    environment.devOAuthBypass &&
    userService.getToken() === TOKEN_SESION_LOCAL &&
    !userService.getRoles().some(esRolTlalcalli);
  if (sesionMockSinRol) {
    userService.logout();
    return router.createUrlTree(['/login']);
  }

  return true;
};
