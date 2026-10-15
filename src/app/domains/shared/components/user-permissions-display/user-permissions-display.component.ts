import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PermissionsService, ModuloPermissions } from '../../../services/permissions.service';
import { UserService } from '../../../services/user.service';
import { MODULOS_TLALCALLI, etiquetaRolPrincipal } from '../../../auth/config/roles.config';
import { UsuarioCompleto } from '../../../interfaces/oauth2.interfaces';

@Component({
  selector: 'app-user-permissions-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tl-card p-6">
      <h3 class="tl-section-heading mb-4 flex items-center gap-2">
        <span class="icon-font text-tlalcalli-primary">security</span>
        Permisos del usuario
      </h3>

      <div class="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-tlalcalli-light-cream p-4 font-noto-sans text-sm">
        <div><span class="text-tlalcalli-gray">Usuario:</span> {{ usuario?.nombre || 'No disponible' }}</div>
        <div><span class="text-tlalcalli-gray">RFC:</span> {{ usuario?.rfc || 'No disponible' }}</div>
        <div class="col-span-2">
          <span class="text-tlalcalli-gray">Rol:</span> {{ etiquetaRol || 'Sin rol de Tlālcalli' }}
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        @for (m of modulos; track m.clave) {
          @let permitido = !!permisos?.[m.clave];
          <div class="flex items-center justify-between rounded-lg border p-3 font-noto-sans text-sm"
            [ngClass]="permitido ? 'border-tlalcalli-success-muted/30 bg-tlalcalli-success-muted/5' : 'border-tlalcalli-error-muted/30 bg-tlalcalli-error-muted/5'">
            <span class="flex items-center gap-2 font-medium">
              <span class="icon-font !text-[18px]">{{ m.icono }}</span>
              {{ m.titulo }}
            </span>
            <span class="text-xs font-semibold" [ngClass]="permitido ? 'text-tlalcalli-success-muted' : 'text-tlalcalli-error-muted'">
              {{ permitido ? 'Permitido' : 'Sin acceso' }}
            </span>
          </div>
        }
      </div>

      <p class="m-0 mt-4 font-noto-sans text-sm text-tlalcalli-gray">
        Acceso a <strong>{{ accesibles }} de {{ modulos.length }}</strong> módulos.
      </p>
    </div>
  `,
})
export class UserPermissionsDisplayComponent implements OnInit, OnDestroy {
  readonly modulos = MODULOS_TLALCALLI;
  permisos: ModuloPermissions | null = null;
  usuario: UsuarioCompleto | null = null;
  etiquetaRol: string | null = null;
  accesibles = 0;

  private subscription = new Subscription();

  constructor(
    private permissionsService: PermissionsService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.permissionsService.getUserPermissions().subscribe((permisos) => {
        this.permisos = permisos;
        this.accesibles = this.modulos.filter((m) => permisos[m.clave]).length;
      })
    );
    this.subscription.add(
      this.userService.getUsuario$().subscribe((usuario) => {
        this.usuario = usuario;
        this.etiquetaRol = usuario ? etiquetaRolPrincipal(usuario.rolesArray) : null;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
