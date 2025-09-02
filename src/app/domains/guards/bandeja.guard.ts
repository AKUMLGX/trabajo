import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionsService } from '../services/permissions.service';
import { map, take } from 'rxjs/operators';

/**
 * Guard que protege el acceso a las bandejas basado en permisos de roles
 * @param bandeja - Nombre de la bandeja a verificar (captura, atencion, dictaminador, seguimiento, reportes, revisionFinal)
 */
export const bandejaGuard = (bandeja: string): CanActivateFn => {
  return () => {
    const permissionsService = inject(PermissionsService);
    const router = inject(Router);

    return permissionsService.canAccessBandeja(bandeja as any).pipe(
      take(1),
      map(hasAccess => {
        if (hasAccess) {
          return true; // ✅ Usuario tiene acceso
        } else {
          // ❌ Usuario no tiene acceso, redirigir a página de acceso denegado
          console.warn(`Acceso denegado a bandeja: ${bandeja}`);
          router.navigate(['/layout/access-denied']);
          return false;
        }
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
