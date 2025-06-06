import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

// Interfaz para los asuntos rechazados
export interface AsuntoRechazado {
  folio: string;
  autoridad: string;
  fechaRechazo: string;
  dictaminador: string;
  motivo: string;
  observaciones?: string;
}

@Component({
  selector: 'app-rechazados-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rechazados-table.component.html',
  styleUrl: './rechazados-table.component.css'
})
export class RechazadosTableComponent {
  // Inputs y Outputs para comunicación con componente padre
  @Input() mostrarTablaRechazadosModal: boolean = false;
  @Input() asuntosRechazados: AsuntoRechazado[] = [];
  
  @Output() cerrarTablaEvent = new EventEmitter<void>();
  @Output() seleccionarAsuntoEvent = new EventEmitter<AsuntoRechazado>();

  // Métodos para manejar eventos
  cerrarTabla(): void {
    this.cerrarTablaEvent.emit();
  }

  seleccionarAsunto(asunto: AsuntoRechazado): void {
    this.seleccionarAsuntoEvent.emit(asunto);
  }
}
