import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../services/user.service';
import { UsuarioCompleto } from '../../interfaces/oauth2.interfaces';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatDividerModule,
    MatProgressBarModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit, OnDestroy {
  @Input() compact: boolean = false; // Para diferentes variaciones del componente
  @Input() showAdvancedInfo: boolean = true; // Mostrar información avanzada (JWT)

  usuario: UsuarioCompleto | null = null;
  private destroy$ = new Subject<void>();

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsuario$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(usuario => {
        this.usuario = usuario;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Obtiene las iniciales del nombre para el avatar
   */
  getIniciales(): string {
    if (!this.usuario?.nombre) return 'U';
    
    const nombres = this.usuario.nombre.split(' ');
    if (nombres.length >= 2) {
      return (nombres[0].charAt(0) + nombres[1].charAt(0)).toUpperCase();
    }
    return this.usuario.nombre.charAt(0).toUpperCase();
  }

  /**
   * Obtiene el color del badge según el tiempo restante
   */
  getBadgeColor(): 'primary' | 'accent' | 'warn' {
    if (!this.usuario) return 'primary';
    
    if (this.usuario.sesionProximaExpirar) return 'warn';
    if (this.usuario.tiempoRestanteSesion <= 60) return 'accent';
    return 'primary';
  }

  /**
   * Obtiene el texto del tiempo restante formateado
   */
  getTiempoRestanteTexto(): string {
    if (!this.usuario) return '';
    
    const minutos = this.usuario.tiempoRestanteSesion;
    if (minutos <= 0) return 'Expirado';
    if (minutos < 60) return `${minutos}m`;
    
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    return `${horas}h ${minutosRestantes}m`;
  }

  /**
   * Obtiene el color del chip para cada rol
   */
  getRolColor(rol: string): string {
    if (rol.includes('SUPERVISA')) return 'primary';
    if (rol.includes('CAPTURA')) return 'accent';
    if (rol.includes('ATENCION')) return 'warn';
    return 'basic';
  }

  /**
   * Obtiene el ícono para cada tipo de rol
   */
  getRolIcon(rol: string): string {
    if (rol.includes('SUPERVISA')) return 'supervisor_account';
    if (rol.includes('CAPTURA')) return 'edit';
    if (rol.includes('ATENCION')) return 'support_agent';
    return 'person';
  }

  /**
   * Formatea la fecha de manera legible
   */
  formatearFecha(fecha: Date): string {
    return fecha.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtiene el porcentaje de tiempo transcurrido de la sesión
   */
  getPorcentajeSesion(): number {
    if (!this.usuario) return 0;
    
    const duracionTotal = this.usuario.fechaExpiracion.getTime() - this.usuario.fechaEmision.getTime();
    const tiempoTranscurrido = Date.now() - this.usuario.fechaEmision.getTime();
    
    return Math.min(100, Math.max(0, (tiempoTranscurrido / duracionTotal) * 100));
  }

  /**
   * Obtiene la descripción del tipo de usuario
   */
  getTipoUsuarioDescripcion(): string {
    if (!this.usuario) return '';
    
    if (this.usuario.esAdmin) return 'Administrador';
    if (this.usuario.esSupervisorAtencion) return 'Supervisor de Atención';
    if (this.usuario.esSupervisor) return 'Supervisor';
    if (this.usuario.esCapturistaAtencion) return 'Capturista de Atención';
    if (this.usuario.esCapturista) return 'Capturista';
    
    return 'Usuario';
  }

  /**
   * Obtiene el ícono para el tipo de usuario
   */
  getTipoUsuarioIcon(): string {
    if (!this.usuario) return 'person';
    
    if (this.usuario.esAdmin) return 'admin_panel_settings';
    if (this.usuario.esSupervisorAtencion) return 'support_agent';
    if (this.usuario.esSupervisor) return 'supervisor_account';
    if (this.usuario.esCapturistaAtencion) return 'edit_note';
    if (this.usuario.esCapturista) return 'edit';
    
    return 'person';
  }
} 