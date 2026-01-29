import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Observable, map } from 'rxjs';

export interface BandejaPermissions {
  captura: boolean;
  atencion: boolean;
  dictaminador: boolean;
  seguimiento: boolean;
  reportes: boolean;
  revisionFinal: boolean;
}

export interface RolePermissions {
  [key: string]: BandejaPermissions;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  // Definición de permisos por rol
  private readonly rolePermissions: RolePermissions = {
    // Akamba 1: captura y seguimiento
    'SIAT_AKAMBA_001_CAPTURA': {
      captura: true,
      atencion: false,
      dictaminador: false,
      seguimiento: true,
      reportes: false,
      revisionFinal: false
    },
    // Akamba 2: captura, seguimiento, reportes y Revisión Final de Asuntos
    'SIAT_AKAMBA_002_SUPERVISA': {
      captura: true,
      atencion: false,
      dictaminador: false,
      seguimiento: true,
      reportes: true,
      revisionFinal: true
    },
    // Akamba 3: Centro de Control de Expedientes (supervisión de atención)
    // NOTA: atencion y dictaminador están en false porque ahora usa
    // el nuevo "Centro de Control de Expedientes" (/layout/responsables)
    // Permisos: captura y seguimiento habilitados
    'SIAT_AKAMBA_003_SUPERVISA_ATENCION': {
      captura: true,
      atencion: false,
      dictaminador: false,
      seguimiento: true,
      reportes: false,
      revisionFinal: false
    },
    // Akamba 4: solo dictaminador
    'SIAT_AKAMBA_004_CAPTURA_ATENCION': {
      captura: false,
      atencion: false,
      dictaminador: true,
      seguimiento: false,
      reportes: false,
      revisionFinal: false
    }
  };

  constructor(private userService: UserService) {}

  /**
   * Obtiene los permisos del usuario actual para todas las bandejas
   */
  getUserPermissions(): Observable<BandejaPermissions> {
    return this.userService.estadoAutenticacion$.pipe(
      map(estado => {
        if (!estado.isAuthenticated || !estado.usuario) {
          return this.getDefaultPermissions();
        }

        const userRoles = estado.usuario.rolesArray;
        return this.calculateUserPermissions(userRoles);
      })
    );
  }

  /**
   * Verifica si el usuario puede acceder a una bandeja específica
   */
  canAccessBandeja(bandeja: keyof BandejaPermissions): Observable<boolean> {
    return this.getUserPermissions().pipe(
      map(permissions => permissions[bandeja])
    );
  }

  /**
   * Obtiene las bandejas a las que el usuario puede acceder
   */
  getAccessibleBandejas(): Observable<string[]> {
    return this.getUserPermissions().pipe(
      map(permissions => {
        const accessible: string[] = [];
        Object.entries(permissions).forEach(([bandeja, hasAccess]) => {
          if (hasAccess) {
            accessible.push(bandeja);
          }
        });
        return accessible;
      })
    );
  }

  /**
   * Calcula los permisos del usuario basado en sus roles
   */
  private calculateUserPermissions(userRoles: string[]): BandejaPermissions {
    // Si no hay roles, no hay permisos
    if (!userRoles || userRoles.length === 0) {
      return this.getDefaultPermissions();
    }

    // Inicializar permisos como false
    const userPermissions: BandejaPermissions = {
      captura: false,
      atencion: false,
      dictaminador: false,
      seguimiento: false,
      reportes: false,
      revisionFinal: false
    };

    // Aplicar permisos de cada rol del usuario
    userRoles.forEach(role => {
      const rolePerms = this.rolePermissions[role];
      if (rolePerms) {
        // Unión de permisos (OR lógico)
        userPermissions.captura = userPermissions.captura || rolePerms.captura;
        userPermissions.atencion = userPermissions.atencion || rolePerms.atencion;
        userPermissions.dictaminador = userPermissions.dictaminador || rolePerms.dictaminador;
        userPermissions.seguimiento = userPermissions.seguimiento || rolePerms.seguimiento;
        userPermissions.reportes = userPermissions.reportes || rolePerms.reportes;
        userPermissions.revisionFinal = userPermissions.revisionFinal || rolePerms.revisionFinal;
      }
    });

    return userPermissions;
  }

  /**
   * Permisos por defecto (sin autenticación)
   */
  private getDefaultPermissions(): BandejaPermissions {
    return {
      captura: false,
      atencion: false,
      dictaminador: false,
      seguimiento: false,
      reportes: false,
      revisionFinal: false
    };
  }

  /**
   * Obtiene el nombre legible de la bandeja
   */
  getBandejaDisplayName(bandeja: string): string {
    const displayNames: { [key: string]: string } = {
      captura: 'Bandeja de Captura',
      atencion: 'Bandeja de Atención',
      dictaminador: 'Bandeja de Dictaminador',
      seguimiento: 'Bandeja de Seguimiento',
      reportes: 'Bandeja de Reportes',
      revisionFinal: 'Revisión Final de Asuntos'
    };
    return displayNames[bandeja] || bandeja;
  }

  /**
   * Obtiene el icono de la bandeja
   */
  getBandejaIcon(bandeja: string): string {
    const icons: { [key: string]: string } = {
      captura: 'dvr',
      atencion: 'dashboard',
      dictaminador: 'gavel',
      seguimiento: 'analytics',
      reportes: 'folder',
      revisionFinal: 'approval'
    };
    return icons[bandeja] || 'help';
  }

  /**
   * Obtiene la ruta de la bandeja
   */
  getBandejaRoute(bandeja: string): string {
    const routes: { [key: string]: string } = {
      captura: '/layout/capture',
      atencion: '/layout/assistance',
      dictaminador: '/layout/dictaminador',
      seguimiento: '/layout/tracking',
      reportes: '/layout/reports',
      revisionFinal: '/layout/revision-final'
    };
    return routes[bandeja] || '/layout';
  }
}
