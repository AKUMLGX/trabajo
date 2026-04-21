import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionsService } from '../services/permissions.service';
import { UserService } from '../services/user.service';
import { map, take } from 'rxjs/operators';

function esSesionDemoLocal(userService: UserService): boolean {
  const token = userService.getToken();
  return (
    token === 'MOCK_ACCESS_TOKEN' ||
    (!!token && token.includes('MOCK_ACCESS_TOKEN'))
  );
}

/**
 * Guard que protege el acceso a las bandejas basado en permisos de roles
 * @param bandeja - Nombre de la bandeja a verificar (captura, atencion, dictaminador, seguimiento, reportes, revisionFinal)
 */

export const bandejaGuard = (bandeja: string): CanActivateFn => {
  return (route, state) => {
    const permissionsService = inject(PermissionsService);
    const userService = inject(UserService);
    const router = inject(Router);

    if (!userService.isAuthenticated()) {
      void router.navigate(['/login']);
      return false;
    }

    // Demo sin OAuth: una sola sesión local → todas las bandejas permitidas.
    if (esSesionDemoLocal(userService)) {
      return true;
    }

    // OAuth real: captura y seguimiento para cualquier sesión (Centro de Control, etc.)
    if (bandeja === 'captura' || bandeja === 'seguimiento') {
      return true;
    }

    return permissionsService.getUserPermissions().pipe(
      take(1),
      map((perms) => {
        // Acceso directo por permiso
        if ((perms as any)[bandeja]) {
          return true;
        }

        // Excepción controlada: permitir acceso a Seguimiento SOLO si viene con query param de búsqueda
        // y el usuario tiene permisos de Atención o Dictaminador (no abre toda la bandeja, solo permite búsqueda directa)
        const hasDirectSearchParam =
          !!route?.queryParamMap?.get('folio') ||
          !!route?.queryParamMap?.get('folio_interno') ||
          !!route?.queryParamMap?.get('folioInterno') ||
          !!route?.queryParamMap?.get('oficio');

        // Permitir a cualquier usuario hacer una búsqueda directa en Seguimiento
        // cuando venga con query param de búsqueda (no expone la bandeja completa)
        if (bandeja === 'seguimiento' && hasDirectSearchParam) {
          return true;
        }

        // Denegar y enviar a Access Denied
        console.warn(`Acceso denegado a bandeja: ${bandeja}`);
        router.navigate(['/layout/access-denied']);
        return false;
      })
    );
  };
};

/** Guards específicos **/
export const capturaGuard = bandejaGuard('captura');
export const atencionGuard = bandejaGuard('atencion');
export const dictaminadorGuard = bandejaGuard('dictaminador');
export const seguimientoGuard = bandejaGuard('seguimiento');
export const reportesGuard = bandejaGuard('reportes');
export const revisionFinalGuard = bandejaGuard('revisionFinal');
