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

// 🆕 Nueva interface para asuntos capturados
interface AsuntoCapturado {
  id: string;
  folio: string;
  fechaCaptura: Date;
  capturadoPor: string;
  estadoCaptura: 'PendienteRevision' | 'RequiereCorreccion' | 'ListoParaEnviar';
  personaRelacionada: string;
  carpetaInvestigacion: string;
  tipoAsunto: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  autoridad: string;
  tieneDocumentos: boolean;
  cantidadDocumentos: number;
  observaciones?: string;
  erroresDetectados?: string[];
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
  
  // 🆕 Datos para asuntos capturados
  asuntosCapturados: AsuntoCapturado[] = [];
  asuntosSeleccionados: string[] = []; // IDs de asuntos seleccionados para envío
  
  // Estadísticas
  estadisticas = {
    // 🆕 Estadísticas para asuntos capturados
    totalCapturados: 0,
    capturadosHoy: 0,
    requierenCorreccion: 0,
    listosParaEnviar: 0,
    
    // ✅ Estadísticas existentes para dictámenes
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
    this.cargarAsuntosCapturados(); // 🆕 Cargar asuntos capturados
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

  // 🆕 Método para cargar asuntos capturados
  cargarAsuntosCapturados(): void {
    this.asuntosCapturados = [
      {
        id: 'CAP-001',
        folio: 'EUACAPE-0030',
        fechaCaptura: new Date('2024-06-09'),
        capturadoPor: 'Ana Martínez (Akamba 1)',
        estadoCaptura: 'RequiereCorreccion',
        personaRelacionada: 'Elena Rodríguez Vega',
        carpetaInvestigacion: 'CI-78950',
        tipoAsunto: 'Evasión Fiscal',
        prioridad: 'Alta',
        autoridad: 'Fiscalía General de la República',
        tieneDocumentos: true,
        cantidadDocumentos: 3,
        erroresDetectados: ['Falta número de RFC', 'Documento ilegible']
      },
      {
        id: 'CAP-002',
        folio: 'EUACAPE-0031',
        fechaCaptura: new Date('2024-06-09'),
        capturadoPor: 'Carlos Ruiz (Akamba 1)',
        estadoCaptura: 'ListoParaEnviar',
        personaRelacionada: 'Roberto Sánchez López',
        carpetaInvestigacion: 'CI-78951',
        tipoAsunto: 'Omisión de Ingresos',
        prioridad: 'Media',
        autoridad: 'Procuraduría Fiscal',
        tieneDocumentos: true,
        cantidadDocumentos: 5,
        erroresDetectados: []
      },
      {
        id: 'CAP-003',
        folio: 'EUACAPE-0032',
        fechaCaptura: new Date('2024-06-08'),
        capturadoPor: 'María Fernández (Akamba 1)',
        estadoCaptura: 'PendienteRevision',
        personaRelacionada: 'Lucía Morales García',
        carpetaInvestigacion: 'CI-78952',
        tipoAsunto: 'Defraudación Fiscal',
        prioridad: 'Alta',
        autoridad: 'Fiscalía General de la República',
        tieneDocumentos: false,
        cantidadDocumentos: 0,
        erroresDetectados: []
      },
      {
        id: 'CAP-004',
        folio: 'EUACAPE-0033',
        fechaCaptura: new Date('2024-06-09'),
        capturadoPor: 'Luis García (Akamba 1)',
        estadoCaptura: 'ListoParaEnviar',
        personaRelacionada: 'Fernando Jiménez Cruz',
        carpetaInvestigacion: 'CI-78953',
        tipoAsunto: 'Contrabando',
        prioridad: 'Baja',
        autoridad: 'Aduanas',
        tieneDocumentos: true,
        cantidadDocumentos: 2,
        erroresDetectados: []
      },
      {
        id: 'CAP-005',
        folio: 'EUACAPE-0034',
        fechaCaptura: new Date('2024-06-08'),
        capturadoPor: 'Sofía Herrera (Akamba 1)',
        estadoCaptura: 'RequiereCorreccion',
        personaRelacionada: 'Patricia Torres Ramírez',
        carpetaInvestigacion: 'CI-78954',
        tipoAsunto: 'Lavado de Dinero',
        prioridad: 'Alta',
        autoridad: 'UIF',
        tieneDocumentos: true,
        cantidadDocumentos: 8,
        erroresDetectados: ['Fecha incorrecta', 'Falta firma digital']
      }
    ];
  }

  actualizarEstadisticas(): void {
    // 🆕 Calcular estadísticas para asuntos capturados
    this.estadisticas.totalCapturados = this.asuntosCapturados.length;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    this.estadisticas.capturadosHoy = this.asuntosCapturados.filter(a => {
      const fechaCaptura = new Date(a.fechaCaptura);
      fechaCaptura.setHours(0, 0, 0, 0);
      return fechaCaptura.getTime() === hoy.getTime();
    }).length;
    
    this.estadisticas.requierenCorreccion = this.asuntosCapturados.filter(a => 
      a.estadoCaptura === 'RequiereCorreccion').length;
    
    this.estadisticas.listosParaEnviar = this.asuntosCapturados.filter(a => 
      a.estadoCaptura === 'ListoParaEnviar').length;

    // ✅ Calcular estadísticas existentes para dictámenes
    this.estadisticas.totalPendientes = this.asuntosPendientes.length;
    
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
  
  /**
   * Método para filtrar asuntos pendientes por rango de días transcurridos
   * @param minDias días mínimos
   * @param maxDias días máximos
   * @returns array de asuntos filtrados
   */
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
  
  /**
   * Formatea una fecha para mostrarla en formato legible
   * @param date fecha a formatear
   * @returns fecha formateada como DD/MM/YYYY
   */
  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Fecha inválida';
    
    return dateObj.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // 🆕 MÉTODOS PARA MANEJO DE ASUNTOS CAPTURADOS

  /**
   * Alterna la selección de un asunto capturado
   * @param asuntoId ID del asunto a seleccionar/deseleccionar
   */
  toggleSeleccionAsunto(asuntoId: string): void {
    const index = this.asuntosSeleccionados.indexOf(asuntoId);
    if (index > -1) {
      this.asuntosSeleccionados.splice(index, 1);
    } else {
      this.asuntosSeleccionados.push(asuntoId);
    }
  }

  /**
   * Verifica si un asunto está seleccionado
   * @param asuntoId ID del asunto
   * @returns true si está seleccionado
   */
  isAsuntoSeleccionado(asuntoId: string): boolean {
    return this.asuntosSeleccionados.includes(asuntoId);
  }

  /**
   * Selecciona o deselecciona todos los asuntos listos para enviar
   */
  toggleSeleccionTodos(): void {
    const asuntosListos = this.asuntosCapturados.filter(a => a.estadoCaptura === 'ListoParaEnviar');
    const todosSeleccionados = asuntosListos.every(a => this.isAsuntoSeleccionado(a.id));
    
    if (todosSeleccionados) {
      // Deseleccionar todos los listos
      asuntosListos.forEach(a => {
        const index = this.asuntosSeleccionados.indexOf(a.id);
        if (index > -1) {
          this.asuntosSeleccionados.splice(index, 1);
        }
      });
    } else {
      // Seleccionar todos los listos
      asuntosListos.forEach(a => {
        if (!this.isAsuntoSeleccionado(a.id)) {
          this.asuntosSeleccionados.push(a.id);
        }
      });
    }
  }

  /**
   * Verifica si todos los asuntos listos están seleccionados
   * @returns true si todos están seleccionados
   */
  todosProntosSeleccionados(): boolean {
    const asuntosListos = this.asuntosCapturados.filter(a => a.estadoCaptura === 'ListoParaEnviar');
    return asuntosListos.length > 0 && asuntosListos.every(a => this.isAsuntoSeleccionado(a.id));
  }

  /**
   * Obtiene el color del estado de captura
   * @param estadoCaptura Estado del asunto capturado
   * @returns Clase CSS para el color
   */
  getColorEstadoCaptura(estadoCaptura: string): string {
    switch (estadoCaptura) {
      case 'PendienteRevision': return 'bg-blue-500 text-white';
      case 'RequiereCorreccion': return 'bg-red-500 text-white';
      case 'ListoParaEnviar': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }

  /**
   * Obtiene la etiqueta del estado de captura
   * @param estadoCaptura Estado del asunto capturado
   * @returns Texto descriptivo del estado
   */
  getEtiquetaEstadoCaptura(estadoCaptura: string): string {
    switch (estadoCaptura) {
      case 'PendienteRevision': return 'Pendiente de Revisión';
      case 'RequiereCorreccion': return 'Requiere Corrección';
      case 'ListoParaEnviar': return 'Listo para Enviar';
      default: return 'Estado Desconocido';
    }
  }

  /**
   * Abre el modal de corrección para un asunto capturado
   * @param asunto Asunto a corregir
   */
  abrirModalCorreccion(asunto: AsuntoCapturado): void {
    // TODO: Implementar modal de corrección
    console.log('Abriendo modal de corrección para:', asunto.folio);
  }

  /**
   * Envía los asuntos seleccionados al Akamba 3
   */
  enviarAsuntosSeleccionados(): void {
    if (this.asuntosSeleccionados.length === 0) {
      alert('No hay asuntos seleccionados para enviar');
      return;
    }

    const asuntosParaEnviar = this.asuntosCapturados.filter(a => 
      this.asuntosSeleccionados.includes(a.id) && a.estadoCaptura === 'ListoParaEnviar'
    );

    if (asuntosParaEnviar.length === 0) {
      alert('Solo se pueden enviar asuntos que estén "Listos para Enviar"');
      return;
    }

    const confirmacion = confirm(
      `¿Está seguro de enviar ${asuntosParaEnviar.length} asunto(s) al Administrador (Akamba 3)?`
    );

    if (confirmacion) {
      // TODO: Implementar llamada al servicio de envío
      console.log('Enviando asuntos:', asuntosParaEnviar);
      
      // Simular envío exitoso
      alert(`Se han enviado ${asuntosParaEnviar.length} asunto(s) exitosamente al Akamba 3`);
      
      // Limpiar selección
      this.asuntosSeleccionados = [];
      
      // En un escenario real, estos asuntos se eliminarían de la lista o cambiarían de estado
    }
  }

  /**
   * Filtra asuntos capturados por texto de búsqueda
   * @returns Array de asuntos filtrados
   */
  getAsuntosCapturasFiltrados(): AsuntoCapturado[] {
    if (!this.filtroText) {
      return this.asuntosCapturados;
    }

    const textoBusqueda = this.filtroText.toLowerCase();
    return this.asuntosCapturados.filter(a => 
      a.folio.toLowerCase().includes(textoBusqueda) ||
      a.personaRelacionada.toLowerCase().includes(textoBusqueda) ||
      a.carpetaInvestigacion.toLowerCase().includes(textoBusqueda) ||
      a.capturadoPor.toLowerCase().includes(textoBusqueda) ||
      a.tipoAsunto.toLowerCase().includes(textoBusqueda)
    );
  }
} 