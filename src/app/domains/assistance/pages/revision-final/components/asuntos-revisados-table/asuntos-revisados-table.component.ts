import { Component, Input, OnInit, ViewChild, OnChanges, AfterViewInit } from '@angular/core';
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
  selector: 'app-asuntos-revisados-table',
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
  templateUrl: './asuntos-revisados-table.component.html',
  styleUrls: ['./asuntos-revisados-table.component.css']
})
export class AsuntosRevisadosTableComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() asuntos: Asunto[] = [];
  @Input() filtroText = '';
  
  displayedColumns: string[] = ['folio', 'carpetaInvestigacion', 'personaRelacionada', 'dictaminador', 'fechaRecepcion', 'diasTranscurridos', 'prioridad', 'estadoAtencion', 'acciones'];
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
    
    // Aplicar filtro de texto
    if (this.filtroText) {
      const textoBusqueda = this.filtroText.toLowerCase();
      asuntosFiltrados = asuntosFiltrados.filter(a => 
        a.folio.toLowerCase().includes(textoBusqueda) ||
        a.personaRelacionada.toLowerCase().includes(textoBusqueda) ||
        a.carpetaInvestigacion.toLowerCase().includes(textoBusqueda) ||
        a.dictaminador.toLowerCase().includes(textoBusqueda) ||
        a.estadoAtencion.toLowerCase().includes(textoBusqueda)
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

  getColorEstado(estado: string): string {
    switch (estado) {
      case 'Aprobado': return 'text-green-600';
      case 'Rechazado': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }
  
  getIconEstado(estado: string): string {
    switch (estado) {
      case 'Aprobado': return 'check_circle';
      case 'Rechazado': return 'cancel';
      default: return 'info';
    }
  }
  
  formatDate(date: Date): string {
    return date ? new Date(date).toLocaleDateString('es-MX') : '';
  }
  
  verDetalle(asunto: Asunto): void {
    this.dialog.open(RevisionDetalleModalComponent, {
      width: '800px',
      data: { asunto, soloLectura: true }
    });
  }
} 