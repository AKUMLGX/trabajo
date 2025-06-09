import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rechazados-gestion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './rechazados-gestion.component.html',
  styleUrls: ['./rechazados-gestion.component.css']
})
export class RechazadosGestionComponent {
  // Inputs y Outputs para comunicación con el componente padre
  @Input() mostrarModalRechazados = false;
  @Input() asuntoRechazado: any = null;
  @Input() dictaminadoresDisponibles: any[] = [];
  @Output() cerrarModalEvent = new EventEmitter<void>();
  @Output() reasignarAsuntoEvent = new EventEmitter<{
    asunto: any,
    nuevoDictaminadorId: string,
    observaciones: string,
    notificar: boolean
  }>();
  @Output() confirmarReasignacionEvent = new EventEmitter<void>();
  @Output() cancelarConfirmacionEvent = new EventEmitter<void>();
  
  // Propiedades para la gestión
  nuevoDictaminadorId: string = '';
  observacionesReasignacion: string = '';
  notificarDictaminador: boolean = true;
  
  // Propiedades para la confirmación
  @Input() mostrarConfirmacionReasignacion = false;
  
  // Obtener el nombre del dictaminador por su ID
  obtenerNombreDictaminador(id: string): string {
    const dictaminador = this.dictaminadoresDisponibles.find(d => d.id === id);
    return dictaminador ? dictaminador.nombre : 'No asignado';
  }
  
  // Métodos para controlar el flujo del modal
  cerrarModalRechazados(): void {
    this.nuevoDictaminadorId = '';
    this.observacionesReasignacion = '';
    this.notificarDictaminador = true;
    this.cerrarModalEvent.emit();
  }
  
  reasignarAsunto(): void {
    if (!this.nuevoDictaminadorId || !this.observacionesReasignacion) {
      return;
    }
    
    this.reasignarAsuntoEvent.emit({
      asunto: this.asuntoRechazado,
      nuevoDictaminadorId: this.nuevoDictaminadorId,
      observaciones: this.observacionesReasignacion,
      notificar: this.notificarDictaminador
    });
  }
  
  cancelarConfirmacionReasignacion(): void {
    this.cancelarConfirmacionEvent.emit();
  }
  
  confirmarReasignacion(): void {
    this.confirmarReasignacionEvent.emit();
  }
}
