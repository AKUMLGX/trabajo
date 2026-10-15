import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PermissionsService } from '../../../services/permissions.service';
import { UserService } from '../../../services/user.service';
import { etiquetaRolPrincipal } from '../../../auth/config/roles.config';

@Component({
    selector: 'app-access-denied',
    imports: [RouterLink],
    template: `
    <div class="flex min-h-full items-center justify-center p-6">
      <div class="tl-card w-full max-w-md p-8 text-center">
        <span class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-tlalcalli-error-muted/10 text-tlalcalli-error-muted">
          <span class="icon-font !text-[32px]">block</span>
        </span>

        <h1 class="tl-section-heading mb-2 text-xl">Acceso denegado</h1>
        <p class="m-0 mb-6 font-noto-sans text-sm text-tlalcalli-gray">
          Tu rol no tiene acceso a esta sección. Si consideras que es un error, solicita el permiso al administrador.
        </p>

        @if (modulos().length) {
          <div class="flex flex-col gap-2">
            @for (m of modulos(); track m.clave) {
              <a [routerLink]="m.ruta" class="tl-btn-secondary justify-center">
                <span class="icon-font !text-[18px]">{{ m.icono }}</span>
                {{ m.titulo }}
              </a>
            }
          </div>
        }

        <p class="m-0 mt-6 font-noto-sans text-xs text-tlalcalli-gray">
          Rol actual: <strong class="text-tlalcalli-deep">{{ rol() }}</strong>
        </p>
      </div>
    </div>
  `,
})
export class AccessDeniedComponent {
  readonly modulos = toSignal(inject(PermissionsService).getModulosAccesibles(), { initialValue: [] });
  readonly rol = toSignal(
    inject(UserService).getUsuario$().pipe(
      map((u) => (u ? etiquetaRolPrincipal(u.rolesArray) ?? 'Sin rol de Tlālcalli' : 'Sin sesión'))
    ),
    { initialValue: 'Sin sesión' }
  );
}
