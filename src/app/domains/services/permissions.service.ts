import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { UserService } from './user.service';
import {
  AccionesPermitidas,
  MODULOS_TLALCALLI,
  ModuloConfig,
  ModuloPermissions,
  ModuloTlalcalli,
  accionesDeRoles,
  permisosDeRoles,
  sinAcciones,
  sinPermisos,
} from '../auth/config/roles.config';
import { EspecialistaSesion } from '../interfaces/oauth2.interfaces';

export type { ModuloPermissions, ModuloTlalcalli } from '../auth/config/roles.config';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  constructor(private userService: UserService) {}

  /** Permisos por módulo del usuario actual; sin sesión, todo en false. */
  getUserPermissions(): Observable<ModuloPermissions> {
    return this.userService.estadoAutenticacion$.pipe(
      map((estado) =>
        estado.isAuthenticated && estado.usuario ? permisosDeRoles(estado.usuario.rolesArray) : sinPermisos()
      )
    );
  }

  canAccessModulo(modulo: ModuloTlalcalli): Observable<boolean> {
    return this.getUserPermissions().pipe(map((permisos) => permisos[modulo]));
  }

  /** false si ningún rol de la sesión puede editar en Consulta, o sin sesión. */
  puedeEditarConsulta(): Observable<boolean> {
    return this.userService.estadoAutenticacion$.pipe(
      map((estado) =>
        estado.isAuthenticated && !!estado.usuario && accionesDeRoles(estado.usuario.rolesArray).editarConsulta
      )
    );
  }

  /** Acciones permitidas del usuario actual; sin sesión, todo en false. */
  getAcciones(): Observable<AccionesPermitidas> {
    return this.userService.estadoAutenticacion$.pipe(
      map((estado) =>
        estado.isAuthenticated && estado.usuario ? accionesDeRoles(estado.usuario.rolesArray) : sinAcciones()
      )
    );
  }

  /** Especialista de la sesión (rol 003); null si el usuario no está ligado a uno. */
  getEspecialistaSesion(): Observable<EspecialistaSesion | null> {
    return this.userService.estadoAutenticacion$.pipe(map((estado) => estado.usuario?.especialista ?? null));
  }

  /** Módulos visibles para el usuario, en el orden del menú. */
  getModulosAccesibles(): Observable<ModuloConfig[]> {
    return this.getUserPermissions().pipe(
      map((permisos) => MODULOS_TLALCALLI.filter((m) => permisos[m.clave]))
    );
  }
}
