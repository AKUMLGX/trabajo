import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafePipe } from '../../../../../shared/pipes/safe.pipe';

export interface AsuntoRechazado {
  folio: string;
  autoridad: string;
  fechaRechazo: string;
  dictaminador: string;
  motivo: string;
  dictaminadorAnterior?: string;
}

@Component({
  selector: 'app-rechazados-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SafePipe
  ],
  templateUrl: './rechazados-table.component.html',
  styleUrls: ['./rechazados-table.component.css']
})
export class RechazadosTableComponent implements OnInit {
  // Hacer Math disponible para la plantilla
  Math = Math;

  // Propiedades para la tabla de asuntos rechazados
  @Input() mostrarTablaRechazadosModal = false;
  @Output() cerrarTablaEvent = new EventEmitter<void>();
  @Output() seleccionarAsuntoEvent = new EventEmitter<any>();

  // Datos para filtrar y ordenar
  filtroRechazados = '';
  ordenRechazados = 'fecha';
  
  // Propiedades para paginación de rechazados
  paginaActualRechazados = 1;
  itemsPorPaginaRechazados = 10;
  totalAsuntosRechazados = 0;
  hayMasPaginasRechazados = false;

  // Datos de asuntos rechazados
  @Input() asuntosRechazados: any[] = [];
  asuntosRechazadosFiltrados: any[] = [];

  constructor() { }

  ngOnInit(): void {
    this.actualizarAsuntosRechazados();
  }

  actualizarAsuntosRechazados(): void {
    this.asuntosRechazadosFiltrados = [...this.asuntosRechazados];
    this.actualizarPaginacionRechazados();
  }

  filtrarAsuntosRechazados(): void {
    if (!this.filtroRechazados.trim()) {
      this.asuntosRechazadosFiltrados = [...this.asuntosRechazados];
    } else {
      const filtro = this.filtroRechazados.toLowerCase();
      this.asuntosRechazadosFiltrados = this.asuntosRechazados.filter(asunto => 
        asunto.folio.toLowerCase().includes(filtro) ||
        asunto.autoridad.toLowerCase().includes(filtro) ||
        asunto.dictaminadorAnterior.toLowerCase().includes(filtro)
      );
    }
    this.ordenarAsuntosRechazados();
    this.actualizarPaginacionRechazados();
  }

  ordenarAsuntosRechazados(): void {
    this.asuntosRechazadosFiltrados.sort((a, b) => {
      if (this.ordenRechazados === 'fecha') {
        return new Date(b.fechaRechazo).getTime() - new Date(a.fechaRechazo).getTime();
      } else if (this.ordenRechazados === 'folio') {
        return a.folio.localeCompare(b.folio);
      } else if (this.ordenRechazados === 'dictaminador') {
        return a.dictaminadorAnterior.localeCompare(b.dictaminadorAnterior);
      }
      return 0;
    });
    this.actualizarPaginacionRechazados();
  }

  actualizarPaginacionRechazados(): void {
    this.totalAsuntosRechazados = this.asuntosRechazadosFiltrados.length;
    this.hayMasPaginasRechazados = this.totalAsuntosRechazados > this.paginaActualRechazados * this.itemsPorPaginaRechazados;
  }

  cambiarPaginaRechazados(accion: 'anterior' | 'siguiente'): void {
    if (accion === 'anterior' && this.paginaActualRechazados > 1) {
      this.paginaActualRechazados--;
    } else if (accion === 'siguiente' && this.hayMasPaginasRechazados) {
      this.paginaActualRechazados++;
    }
  }

  seleccionarAsuntoRechazado(asunto: any): void {
    this.seleccionarAsuntoEvent.emit(asunto);
  }

  cerrarTablaRechazados(): void {
    this.cerrarTablaEvent.emit();
  }
}
