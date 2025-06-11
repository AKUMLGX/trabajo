import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { AsuntosPendientesTableComponent } from './components/asuntos-pendientes-table/asuntos-pendientes-table.component';
import { AsuntosRevisadosTableComponent } from './components/asuntos-revisados-table/asuntos-revisados-table.component';
import { RevisionDetalleModalComponent } from './components/revision-detalle-modal/revision-detalle-modal.component';

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
  selector: 'app-revision-final',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatCardModule,
    MatChipsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule,
    AsuntosPendientesTableComponent,
    AsuntosRevisadosTableComponent,
    RevisionDetalleModalComponent
  ],
  templateUrl: './revision-final.component.html',
  styleUrls: ['./revision-final.component.css']
})
export class RevisionFinalComponent implements OnInit {
  
  // Datos de ejemplo para las tablas
  asuntosPendientes: Asunto[] = [];
  asuntosRevisados: Asunto[] = [];
  
  // Estadísticas
  estadisticas = {
    totalPendientes: 0,
    pendientesHoy: 0,
    pendientesUrgentes: 0,
    totalRevisados: 0,
    aprobados: 0,
    rechazados: 0
  };
  
  // Filtros
  filtroEstado: string = 'Todos';
  filtroPrioridad: string = 'Todas';
  filtroText: string = '';

  // Propiedades para la vista de asuntos pendientes
  vistaPendientes: string = 'tabla'; // 'tabla', 'grid' o 'kanban'

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    // Cargar datos de ejemplo
    this.cargarDatosEjemplo();
    this.actualizarEstadisticas();
  }

  cargarDatosEjemplo(): void {
    // Asuntos pendientes de revisión
    this.asuntosPendientes = [
      {
        id: '001',
        folio: 'EUACAPE-0021',
        personaRelacionada: 'María González López',
        fechaRecepcion: new Date('2024-05-20'),
        fechaLimite: new Date('2024-06-15'),
        diasTranscurridos: 20,
        estadoAtencion: 'Finalizado',
        prioridad: 'Alta',
        dictaminador: 'Juan Pérez',
        carpetaInvestigacion: 'CI-78945',
        estado: 'Pendiente'
      },
      {
        id: '002',
        folio: 'EUACAPE-0022',
        personaRelacionada: 'Juan Pérez Ramírez',
        fechaRecepcion: new Date('2024-05-30'),
        fechaLimite: new Date('2024-06-25'),
        diasTranscurridos: 10,
        estadoAtencion: 'Finalizado',
        prioridad: 'Media',
        dictaminador: 'Ana López',
        carpetaInvestigacion: 'CI-78946',
        estado: 'Pendiente'
      },
      {
        id: '003',
        folio: 'EUACAPE-0023',
        personaRelacionada: 'Carlos Sánchez Ruiz',
        fechaRecepcion: new Date('2024-06-06'),
        fechaLimite: new Date('2024-06-30'),
        diasTranscurridos: 3,
        estadoAtencion: 'Finalizado',
        prioridad: 'Baja',
        dictaminador: 'Luis Martínez',
        carpetaInvestigacion: 'CI-78947',
        estado: 'Pendiente'
      },
      {
        id: '004',
        folio: 'EUACAPE-0024',
        personaRelacionada: 'Roberto Juárez Gómez',
        fechaRecepcion: new Date('2024-06-01'),
        fechaLimite: new Date('2024-06-20'),
        diasTranscurridos: 8,
        estadoAtencion: 'Finalizado',
        prioridad: 'Alta',
        dictaminador: 'Carmen Vega',
        carpetaInvestigacion: 'CI-78948',
        estado: 'Pendiente'
      },
      {
        id: '005',
        folio: 'EUACAPE-0025',
        personaRelacionada: 'Laura Estrada Campos',
        fechaRecepcion: new Date('2024-06-05'),
        fechaLimite: new Date('2024-06-28'),
        diasTranscurridos: 4,
        estadoAtencion: 'Finalizado',
        prioridad: 'Media',
        dictaminador: 'Miguel Ángel Torres',
        carpetaInvestigacion: 'CI-78949',
        estado: 'Pendiente'
      }
    ];

    // Asuntos ya revisados
    this.asuntosRevisados = [
      {
        id: '006',
        folio: 'EUACAPE-0016',
        personaRelacionada: 'Pedro Domínguez Vargas',
        fechaRecepcion: new Date('2024-05-10'),
        fechaLimite: new Date('2024-06-05'),
        diasTranscurridos: 30,
        estadoAtencion: 'Aprobado',
        prioridad: 'Alta',
        dictaminador: 'Juan Pérez',
        carpetaInvestigacion: 'CI-78940',
        estado: 'Completado'
      },
      {
        id: '007',
        folio: 'EUACAPE-0017',
        personaRelacionada: 'Sofía Mendoza Quiroz',
        fechaRecepcion: new Date('2024-05-15'),
        fechaLimite: new Date('2024-06-10'),
        diasTranscurridos: 25,
        estadoAtencion: 'Rechazado',
        prioridad: 'Baja',
        dictaminador: 'Ana López',
        carpetaInvestigacion: 'CI-78941',
        estado: 'Completado'
      },
      {
        id: '008',
        folio: 'EUACAPE-0018',
        personaRelacionada: 'Antonio Reyes Lara',
        fechaRecepcion: new Date('2024-05-18'),
        fechaLimite: new Date('2024-06-12'),
        diasTranscurridos: 22,
        estadoAtencion: 'Aprobado',
        prioridad: 'Media',
        dictaminador: 'Luis Martínez',
        carpetaInvestigacion: 'CI-78942',
        estado: 'Completado'
      }
    ];
  }

  actualizarEstadisticas(): void {
    // Calcular estadísticas
    this.estadisticas.totalPendientes = this.asuntosPendientes.length;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    this.estadisticas.pendientesHoy = this.asuntosPendientes.filter(a => {
      const fechaLimite = new Date(a.fechaLimite);
      fechaLimite.setHours(0, 0, 0, 0);
      return fechaLimite.getTime() === hoy.getTime();
    }).length;
    
    this.estadisticas.pendientesUrgentes = this.asuntosPendientes.filter(a => a.prioridad === 'Alta').length;
    
    this.estadisticas.totalRevisados = this.asuntosRevisados.length;
    this.estadisticas.aprobados = this.asuntosRevisados.filter(a => a.estadoAtencion === 'Aprobado').length;
    this.estadisticas.rechazados = this.asuntosRevisados.filter(a => a.estadoAtencion === 'Rechazado').length;
  }

  aprobarAsunto(asunto: Asunto): void {
    // Lógica para aprobar un asunto
    const index = this.asuntosPendientes.findIndex(a => a.id === asunto.id);
    
    if (index !== -1) {
      const asuntoAprobado = {...this.asuntosPendientes[index]};
      asuntoAprobado.estadoAtencion = 'Aprobado';
      asuntoAprobado.estado = 'Completado';
      
      this.asuntosPendientes.splice(index, 1);
      this.asuntosRevisados.unshift(asuntoAprobado);
      
      this.actualizarEstadisticas();
    }
  }

  rechazarAsunto(asunto: Asunto): void {
    // Lógica para rechazar un asunto
    const index = this.asuntosPendientes.findIndex(a => a.id === asunto.id);
    
    if (index !== -1) {
      const asuntoRechazado = {...this.asuntosPendientes[index]};
      asuntoRechazado.estadoAtencion = 'Rechazado';
      asuntoRechazado.estado = 'Completado';
      
      this.asuntosPendientes.splice(index, 1);
      this.asuntosRevisados.unshift(asuntoRechazado);
      
      this.actualizarEstadisticas();
    }
  }
  
  onFiltroTextChange(filtro: string): void {
    this.filtroText = filtro;
  }

  openRevisionDetalleModal(asunto: Asunto): void {
    const dialogRef = this.dialog.open(RevisionDetalleModalComponent, {
      data: { asunto }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.accion === 'aprobar') {
          this.aprobarAsunto(result.asunto);
        } else if (result.accion === 'rechazar') {
          this.rechazarAsunto(result.asunto);
        }
      }
    });
  }

  // Métodos para las vistas alternativas de asuntos pendientes
  getAsuntosPendientesFiltered(): Asunto[] {
    let asuntosFiltrados = [...this.asuntosPendientes];
    
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
    
    return asuntosFiltrados;
  }
  
  getAsuntosPendientesByPrioridad(prioridad: string): Asunto[] {
    let asuntos = this.asuntosPendientes.filter(a => a.prioridad === prioridad);
    
    // Aplicar filtro de texto
    if (this.filtroText) {
      const textoBusqueda = this.filtroText.toLowerCase();
      asuntos = asuntos.filter(a => 
        a.folio.toLowerCase().includes(textoBusqueda) ||
        a.personaRelacionada.toLowerCase().includes(textoBusqueda) ||
        a.carpetaInvestigacion.toLowerCase().includes(textoBusqueda) ||
        a.dictaminador.toLowerCase().includes(textoBusqueda)
      );
    }
    
    return asuntos;
  }
  
  getAsuntosPendientesPorDias(minDias: number, maxDias: number): Asunto[] {
    let asuntos = this.asuntosPendientes.filter(a => 
      a.diasTranscurridos >= minDias && a.diasTranscurridos <= maxDias
    );
    
    // Aplicar filtro de texto
    if (this.filtroText) {
      const textoBusqueda = this.filtroText.toLowerCase();
      asuntos = asuntos.filter(a => 
        a.folio.toLowerCase().includes(textoBusqueda) ||
        a.personaRelacionada.toLowerCase().includes(textoBusqueda) ||
        a.carpetaInvestigacion.toLowerCase().includes(textoBusqueda) ||
        a.dictaminador.toLowerCase().includes(textoBusqueda)
      );
    }
    
    // Aplicar filtro de prioridad
    if (this.filtroPrioridad !== 'Todas') {
      asuntos = asuntos.filter(a => a.prioridad === this.filtroPrioridad);
    }
    
    return asuntos;
  }
  
  formatDate(date: Date): string {
    return date ? new Date(date).toLocaleDateString('es-MX') : '';
  }
} 