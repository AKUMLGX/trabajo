import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RevisionDetalleModalComponent } from '../revision-detalle-modal/revision-detalle-modal.component';

interface Asunto {
  id: string;
  folio: string;
  personaRelacionada: string;
  fechaRecepcion: Date;
  fechaLimite: Date;
  diasTranscurridos: number;
  estadoAtencion: string;
  prioridad: string;
  dictaminador: string;
  carpetaInvestigacion: string;
  estado: string;
}

@Component({
  selector: 'app-asuntos-pendientes-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './asuntos-pendientes-table.component.html',
  styleUrls: ['./asuntos-pendientes-table.component.css']
})
export class AsuntosPendientesTableComponent implements OnInit {
  @Input() asuntos: Asunto[] = [];
  @Input() filtroText: string = '';
  @Input() filtroPrioridad: string = 'Todas';
  
  @Output() aprobar = new EventEmitter<Asunto>();
  @Output() rechazar = new EventEmitter<Asunto>();
  @Output() verDetalleClick = new EventEmitter<Asunto>();
  
  displayedColumns: string[] = ['folio', 'carpetaInvestigacion', 'personaRelacionada', 'dictaminador', 'fechaRecepcion', 'fechaLimite', 'diasTranscurridos', 'prioridad', 'acciones'];
  dataSource = new MatTableDataSource<Asunto>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor(private dialog: MatDialog) {}
  
  ngOnInit(): void {
    this.actualizarTabla();
  }
  
  ngOnChanges(): void {
    this.actualizarTabla();
  }
  
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  actualizarTabla(): void {
    let asuntosFiltrados = [...this.asuntos];
    
    // Aplicar filtro de prioridad
    if (this.filtroPrioridad !== 'Todas') {
      asuntosFiltrados = asuntosFiltrados.filter(a => a.prioridad === this.filtroPrioridad);
    }
    
    // Aplicar filtro de texto
    if (this.filtroText) {
      const textoBusqueda = this.filtroText.toLowerCase();
      asuntosFiltrados = asuntosFiltrados.filter(a => 
        a.folio.toLowerCase().includes(textoBusqueda) ||
        a.personaRelacionada.toLowerCase().includes(textoBusqueda) ||
        a.carpetaInvestigacion.toLowerCase().includes(textoBusqueda) ||
        a.dictaminador.toLowerCase().includes(textoBusqueda)
      );
    }
    
    this.dataSource.data = asuntosFiltrados;
  }
  
  getColorPrioridad(prioridad: string): string {
    switch (prioridad) {
      case 'Alta': return 'bg-red-500';
      case 'Media': return 'bg-yellow-500';
      case 'Baja': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }
  
  formatDate(date: Date): string {
    return date ? new Date(date).toLocaleDateString('es-MX') : '';
  }
  
  aprobarAsunto(asunto: Asunto): void {
    this.aprobar.emit(asunto);
  }
  
  rechazarAsunto(asunto: Asunto): void {
    this.rechazar.emit(asunto);
  }
  
  verDetalle(asunto: Asunto): void {
    this.verDetalleClick.emit(asunto);
  }
} 