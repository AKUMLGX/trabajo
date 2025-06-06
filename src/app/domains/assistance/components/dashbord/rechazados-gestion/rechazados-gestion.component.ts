import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AsuntoRechazado } from '../rechazados-table/rechazados-table.component';

// Interfaz para los dictaminadores disponibles
export interface Dictaminador {
  id: string;
  nombre: string;
}

@Component({
  selector: 'app-rechazados-gestion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rechazados-gestion.component.html',
  styleUrl: './rechazados-gestion.component.css'
})
export class RechazadosGestionComponent {
  // Inputs y Outputs para comunicación con componente padre
  @Input() mostrarModalRechazados: boolean = false;
  @Input() asuntoRechazado: AsuntoRechazado | null = null;
  @Input() dictaminadoresDisponibles: Dictaminador[] = [];
  @Input() mostrarConfirmacionReasignacion: boolean = false;
  
  @Output() cerrarModalEvent = new EventEmitter<void>();
  @Output() reasignarAsuntoEvent = new EventEmitter<string>();
  @Output() confirmarReasignacionEvent = new EventEmitter<void>();
  @Output() cancelarConfirmacionEvent = new EventEmitter<void>();

  // Métodos para manejar eventos
  cerrarModal(): void {
    this.cerrarModalEvent.emit();
  }

  reasignarAsunto(dictaminadorId: string): void {
    if (!dictaminadorId) {
      // Aquí podrías manejar la validación
      return;
    }
    this.reasignarAsuntoEvent.emit(dictaminadorId);
  }

  confirmarReasignacion(): void {
    this.confirmarReasignacionEvent.emit();
  }

  cancelarConfirmacion(): void {
    this.cancelarConfirmacionEvent.emit();
  }
}
