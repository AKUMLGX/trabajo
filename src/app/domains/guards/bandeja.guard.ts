import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ModuloTlalcalli } from '../auth/config/roles.config';
import { PermissionsService } from '../services/permissions.service';
import { UserService } from '../services/user.service';
import { map, take } from 'rxjs/operators';

/**
 * Protege un módulo de Tlálcalli según la matriz de `roles.config.ts`.
 * También aplica en modo local: la sesión de prueba lleva el rol elegido en el login.
 */
export const moduloGuard = (modulo: ModuloTlalcalli): CanActivateFn => {
  return () => {
    const permissionsService = inject(PermissionsService);
    const userService = inject(UserService);
    const router = inject(Router);

    if (!userService.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    return permissionsService.getUserPermissions().pipe(
      take(1),
      map((permisos) => {
        if (permisos[modulo]) {
          return true;
        }

        console.warn(`Acceso denegado al módulo: ${modulo}`);
        return router.createUrlTree(['/layout/access-denied']);
      })
    );
  };
};

/** Pantallas heredadas de Akamba fuera del menú de Tlálcalli: solo navegables en modo local. */
export const legadoAkambaGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (!inject(UserService).isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  return environment.devOAuthBypass ? true : router.createUrlTree(['/layout/access-denied']);
};

export const capturaGuard = moduloGuard('captura');
export const consultaGuard = moduloGuard('consulta');
export const asignacionGuard = moduloGuard('asignacion');
export const atencionCierreGuard = moduloGuard('atencionCierre');
export const estadisticosGuard = moduloGuard('estadisticos');
