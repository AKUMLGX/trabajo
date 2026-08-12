import { Component } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
    selector: 'app-access-denied',
    imports: [MatIconModule, MatButtonModule],
    template: `
    <div class="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">

        <!-- Icono de acceso denegado -->
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span class="icon-font text-red-600 text-4xl">block</span>
        </div>

        <!-- Título y mensaje -->
        <h1 class="text-2xl font-noto-sans text-gray-900 mb-4">
          Acceso Denegado
        </h1>

        <p class="text-gray-600 mb-6">
          No tienes permisos para acceder a esta sección del sistema.
          Contacta a tu administrador si consideras que esto es un error.
        </p>

        <!-- Botones de acción -->
        <div class="space-y-3">
          <button
            mat-raised-button
            color="primary"
            (click)="volverInicio()"
            class="w-full">
            <span class="icon-font mr-2">home</span>
            Volver al Inicio
          </button>

          <button
            mat-stroked-button
            (click)="irBandejasDisponibles()"
            class="w-full">
            <span class="icon-font mr-2">list</span>
            Ver Bandejas Disponibles
          </button>
        </div>

        <!-- Información adicional -->
        <div class="mt-8 p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-500">
            <span class="icon-font text-gray-400 text-sm mr-1">info</span>
            Tu rol actual: <span class="font-noto-sans font-medium">{{ obtenerRolUsuario() }}</span>
          </p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class AccessDeniedComponent {

  constructor(private router: Router) {}

  /**
   * Vuelve a la página principal del layout
   */
  volverInicio(): void {
    this.router.navigate(['/layout']);
  }

  /**
   * Navega a las bandejas disponibles para el usuario
   */
  irBandejasDisponibles(): void {
    this.router.navigate(['/layout']);
  }

  /**
   * Obtiene el rol del usuario actual (placeholder)
   */
  obtenerRolUsuario(): string {
    // TODO: Implementar obtención del rol del usuario actual
    return 'Usuario';
  }
}
