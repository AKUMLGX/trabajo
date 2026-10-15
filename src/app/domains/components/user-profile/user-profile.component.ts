import { Component, EventEmitter, Output, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../../services/user.service';
import {
  MODULOS_TLALCALLI,
  TOKEN_SESION_LOCAL,
  accionesDeRoles,
  etiquetaRolPrincipal,
  permisosDeRoles,
} from '../../auth/config/roles.config';

/** Perfil construido solo con lo que entrega la autenticación (sessionInfo + claims del JWT). */
@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
})
export class UserProfileComponent {
  @Output() closeProfile = new EventEmitter<void>();

  readonly usuario = toSignal(inject(UserService).getUsuario$(), { initialValue: null });

  readonly iniciales = computed(() => {
    const palabras = (this.usuario()?.nombre || '').trim().split(/\s+/).filter(Boolean);
    return palabras.slice(0, 2).map((p) => p.charAt(0)).join('').toUpperCase() || 'U';
  });

  readonly sesionLocal = computed(() => this.usuario()?.token === TOKEN_SESION_LOCAL);

  readonly rol = computed(() => {
    const u = this.usuario();
    return u ? etiquetaRolPrincipal(u.rolesArray) ?? 'Sin rol de Tlālcalli' : '';
  });

  readonly modulos = computed(() => {
    const u = this.usuario();
    if (!u) return '';
    const permisos = permisosDeRoles(u.rolesArray);
    const acciones = accionesDeRoles(u.rolesArray);
    return (
      MODULOS_TLALCALLI.filter((m) => permisos[m.clave])
        .map((m) => {
          const soloLectura =
            (m.clave === 'consulta' && !acciones.editarConsulta) || (m.clave === 'asignacion' && !acciones.editarSeguimiento);
          return soloLectura ? `${m.titulo} (solo lectura)` : m.titulo;
        })
        .join(', ') || 'Ninguno'
    );
  });

  readonly vence = computed(() => {
    const fecha = this.usuario()?.fechaExpiracion;
    return fecha
      ? fecha.toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '';
  });
}
