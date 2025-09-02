import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { PermissionsService, BandejaPermissions } from '../../../services/permissions.service';
import { UserService } from '../../../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-permissions-display',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCardModule, MatChipsModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <mat-icon class="mr-2 text-blue-600">security</mat-icon>
        Permisos del Usuario
      </h3>
      
      <!-- Información del usuario -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-medium text-gray-600">Usuario:</span>
            <span class="ml-2 text-gray-900">{{ usuario?.nombre || 'No disponible' }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">RFC:</span>
            <span class="ml-2 text-gray-900">{{ usuario?.rfc || 'No disponible' }}</span>
          </div>
          <div>
            <span class="font-medium text-gray-600">Roles:</span>
            <div class="flex flex-wrap gap-1 mt-1">
              <span 
                *ngFor="let rol of usuario?.rolesArray || []" 
                class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {{ rol }}
              </span>
            </div>
          </div>
          <div>
            <span class="font-medium text-gray-600">Administración:</span>
            <span class="ml-2 text-gray-900">{{ usuario?.descripcionAdministracion || 'No disponible' }}</span>
          </div>
        </div>
      </div>

      <!-- Permisos por bandeja -->
      <div class="space-y-3">
        <h4 class="font-medium text-gray-700 mb-3">Acceso a Bandejas:</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Bandeja de Captura -->
          <div class="flex items-center justify-between p-3 border rounded-lg" 
               [class]="permissions?.captura ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'">
            <div class="flex items-center">
              <mat-icon class="mr-2" [class]="permissions?.captura ? 'text-green-600' : 'text-red-600'">
                {{ permissions?.captura ? 'check_circle' : 'block' }}
              </mat-icon>
              <span class="font-medium">Bandeja de Captura</span>
            </div>
            <span 
              class="px-3 py-1 rounded-full text-xs font-medium"
              [class]="permissions?.captura ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              {{ permissions?.captura ? 'Acceso Permitido' : 'Acceso Denegado' }}
            </span>
          </div>

          <!-- Bandeja de Atención -->
          <div class="flex items-center justify-between p-3 border rounded-lg" 
               [class]="permissions?.atencion ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'">
            <div class="flex items-center">
              <mat-icon class="mr-2" [class]="permissions?.atencion ? 'text-green-600' : 'text-red-600'">
                {{ permissions?.atencion ? 'check_circle' : 'block' }}
              </mat-icon>
              <span class="font-medium">Bandeja de Atención</span>
            </div>
            <span 
              class="px-3 py-1 rounded-full text-xs font-medium"
              [class]="permissions?.atencion ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              {{ permissions?.atencion ? 'Acceso Permitido' : 'Acceso Denegado' }}
            </span>
          </div>

          <!-- Bandeja de Dictaminador -->
          <div class="flex items-center justify-between p-3 border rounded-lg" 
               [class]="permissions?.dictaminador ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'">
            <div class="flex items-center">
              <mat-icon class="mr-2" [class]="permissions?.dictaminador ? 'text-green-600' : 'text-red-600'">
                {{ permissions?.dictaminador ? 'check_circle' : 'block' }}
              </mat-icon>
              <span class="font-medium">Bandeja de Dictaminador</span>
            </div>
            <span 
              class="px-3 py-1 rounded-full text-xs font-medium"
              [class]="permissions?.dictaminador ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              {{ permissions?.dictaminador ? 'Acceso Permitido' : 'Acceso Denegado' }}
            </span>
          </div>

          <!-- Bandeja de Seguimiento -->
          <div class="flex items-center justify-between p-3 border rounded-lg" 
               [class]="permissions?.seguimiento ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'">
            <div class="flex items-center">
              <mat-icon class="mr-2" [class]="permissions?.seguimiento ? 'text-green-600' : 'text-red-600'">
                {{ permissions?.seguimiento ? 'check_circle' : 'block' }}
              </mat-icon>
              <span class="font-medium">Bandeja de Seguimiento</span>
            </div>
            <span 
              class="px-3 py-1 rounded-full text-xs font-medium"
              [class]="permissions?.seguimiento ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              {{ permissions?.seguimiento ? 'Acceso Permitido' : 'Acceso Denegado' }}
            </span>
          </div>

          <!-- Bandeja de Reportes -->
          <div class="flex items-center justify-between p-3 border rounded-lg" 
               [class]="permissions?.reportes ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'">
            <div class="flex items-center">
              <mat-icon class="mr-2" [class]="permissions?.reportes ? 'text-green-600' : 'text-red-600'">
                {{ permissions?.reportes ? 'check_circle' : 'block' }}
              </mat-icon>
              <span class="font-medium">Bandeja de Reportes</span>
            </div>
            <span 
              class="px-3 py-1 rounded-full text-xs font-medium"
              [class]="permissions?.reportes ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              {{ permissions?.reportes ? 'Acceso Permitido' : 'Acceso Denegado' }}
            </span>
          </div>

          <!-- Revisión Final de Asuntos -->
          <div class="flex items-center justify-between p-3 border rounded-lg" 
               [class]="permissions?.revisionFinal ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'">
            <div class="flex items-center">
              <mat-icon class="mr-2" [class]="permissions?.revisionFinal ? 'text-green-600' : 'text-red-600'">
                {{ permissions?.revisionFinal ? 'check_circle' : 'block' }}
              </mat-icon>
              <span class="font-medium">Revisión Final de Asuntos</span>
            </div>
            <span 
              class="px-3 py-1 rounded-full text-xs font-medium"
              [class]="permissions?.revisionFinal ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              {{ permissions?.revisionFinal ? 'Acceso Permitido' : 'Acceso Denegado' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Resumen de permisos -->
      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-center mb-2">
          <mat-icon class="text-blue-600 mr-2">info</mat-icon>
          <span class="font-medium text-blue-800">Resumen de Permisos</span>
        </div>
        <p class="text-blue-700 text-sm">
          Tienes acceso a <strong>{{ bandejasAccesibles }} de 6</strong> bandejas del sistema.
          {{ bandejasAccesibles === 6 ? 'Tienes acceso completo al sistema.' : 'Tu acceso está limitado según tu rol.' }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class UserPermissionsDisplayComponent implements OnInit, OnDestroy {
  permissions: BandejaPermissions | null = null;
  usuario: any = null;
  bandejasAccesibles: number = 0;
  
  private subscription: Subscription = new Subscription();

  constructor(
    private permissionsService: PermissionsService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.cargarPermisos();
    this.cargarUsuario();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private cargarPermisos(): void {
    this.subscription.add(
      this.permissionsService.getUserPermissions().subscribe(permissions => {
        this.permissions = permissions;
        this.calcularBandejasAccesibles();
      })
    );
  }

  private cargarUsuario(): void {
    this.subscription.add(
      this.userService.estadoAutenticacion$.subscribe(estado => {
        this.usuario = estado.usuario;
      })
    );
  }

  private calcularBandejasAccesibles(): void {
    if (!this.permissions) {
      this.bandejasAccesibles = 0;
      return;
    }

    this.bandejasAccesibles = Object.values(this.permissions).filter(permiso => permiso).length;
  }
}
