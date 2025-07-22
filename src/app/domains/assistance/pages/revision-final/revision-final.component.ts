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
import { RevisionCapturaModalComponent } from './components/revision-captura-modal/revision-captura-modal.component';

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
  carpeta_investigacion: string;
  autoridad_solicitante: string;
  asunto: string;
  fecha_captura: string;
  usuario_captura: string;
  estado_revision: 'PENDIENTE' | 'CORREGIDO' | 'APROBADO' | 'RECHAZADO';
  observaciones_akamba1?: string;
  documento_pdf?: string;
  fecha_limite?: string;
  prioridad?: 'ALTA' | 'MEDIA' | 'BAJA';
  // Campos adicionales para la tabla
  personaRelacionada?: string;
  tipoAsunto?: string;
  tieneDocumentos?: boolean;
  cantidadDocumentos?: number;
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
    RevisionDetalleModalComponent,
    RevisionCapturaModalComponent
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
  filtroEstado = 'Todos';
  filtroPrioridad = 'Todas';
  filtroText = '';

  // Propiedades para la vista de asuntos pendientes
  vistaPendientes = 'tabla'; // 'tabla', 'grid' o 'kanban'

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
        fecha_captura: '2024-06-09T10:30:00',
        usuario_captura: 'Ana Martínez (Akamba 1)',
        estado_revision: 'PENDIENTE',
        personaRelacionada: 'Elena Rodríguez Vega',
        carpeta_investigacion: 'CI-78950',
        autoridad_solicitante: 'Fiscalía General de la República',
        asunto: 'Investigación por evasión fiscal empresarial',
        tipoAsunto: 'Evasión Fiscal',
        prioridad: 'ALTA',
        tieneDocumentos: true,
        cantidadDocumentos: 3,
        erroresDetectados: ['Falta número de RFC', 'Documento ilegible']
      },
      {
        id: 'CAP-002',
        folio: 'EUACAPE-0031',
        fecha_captura: '2024-06-09T11:15:00',
        usuario_captura: 'Carlos Ruiz (Akamba 1)',
        estado_revision: 'APROBADO',
        personaRelacionada: 'Roberto Sánchez López',
        carpeta_investigacion: 'CI-78951',
        autoridad_solicitante: 'Procuraduría Fiscal',
        asunto: 'Análisis de omisión de ingresos por actividades comerciales',
        tipoAsunto: 'Omisión de Ingresos',
        prioridad: 'MEDIA',
        tieneDocumentos: true,
        cantidadDocumentos: 5,
        erroresDetectados: []
      },
      {
        id: 'CAP-003',
        folio: 'EUACAPE-0032',
        fecha_captura: '2024-06-08T14:20:00',
        usuario_captura: 'María Fernández (Akamba 1)',
        estado_revision: 'PENDIENTE',
        personaRelacionada: 'Lucía Morales García',
        carpeta_investigacion: 'CI-78952',
        autoridad_solicitante: 'Fiscalía General de la República',
        asunto: 'Investigación por defraudación fiscal mediante facturas falsas',
        tipoAsunto: 'Defraudación Fiscal',
        prioridad: 'ALTA',
        tieneDocumentos: false,
        cantidadDocumentos: 0,
        erroresDetectados: []
      },
      {
        id: 'CAP-004',
        folio: 'EUACAPE-0033',
        fecha_captura: '2024-06-09T09:45:00',
        usuario_captura: 'Luis García (Akamba 1)',
        estado_revision: 'APROBADO',
        personaRelacionada: 'Fernando Jiménez Cruz',
        carpeta_investigacion: 'CI-78953',
        autoridad_solicitante: 'Aduanas',
        asunto: 'Investigación por contrabando de mercancías',
        tipoAsunto: 'Contrabando',
        prioridad: 'BAJA',
        tieneDocumentos: true,
        cantidadDocumentos: 2,
        erroresDetectados: []
      },
      {
        id: 'CAP-005',
        folio: 'EUACAPE-0034',
        fecha_captura: '2024-06-08T16:10:00',
        usuario_captura: 'Sofía Herrera (Akamba 1)',
        estado_revision: 'RECHAZADO',
        personaRelacionada: 'Patricia Torres Ramírez',
        carpeta_investigacion: 'CI-78954',
        autoridad_solicitante: 'UIF',
        asunto: 'Análisis de operaciones sospechosas de lavado de dinero',
        tipoAsunto: 'Lavado de Dinero',
        prioridad: 'ALTA',
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
      const fechaCaptura = new Date(a.fecha_captura);
      fechaCaptura.setHours(0, 0, 0, 0);
      return fechaCaptura.getTime() === hoy.getTime();
    }).length;
    
    this.estadisticas.requierenCorreccion = this.asuntosCapturados.filter(a => 
      a.estado_revision === 'RECHAZADO').length;
    
    this.estadisticas.listosParaEnviar = this.asuntosCapturados.filter(a => 
      a.estado_revision === 'APROBADO').length;

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
    const asuntosListos = this.asuntosCapturados.filter(a => a.estado_revision === 'APROBADO');
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
    const asuntosListos = this.asuntosCapturados.filter(a => a.estado_revision === 'APROBADO');
    return asuntosListos.length > 0 && asuntosListos.every(a => this.isAsuntoSeleccionado(a.id));
  }

  /**
   * Obtiene el color del estado de revisión
   * @param estadoRevision Estado del asunto capturado
   * @returns Clase CSS para el color
   */
  getColorEstadoCaptura(estadoRevision: string): string {
    switch (estadoRevision) {
      case 'PENDIENTE': return 'bg-blue-500 text-white';
      case 'RECHAZADO': return 'bg-red-500 text-white';
      case 'CORREGIDO': return 'bg-orange-500 text-white';
      case 'APROBADO': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }

  /**
   * Obtiene la etiqueta del estado de revisión
   * @param estadoRevision Estado del asunto capturado
   * @returns Texto descriptivo del estado
   */
  getEtiquetaEstadoCaptura(estadoRevision: string): string {
    switch (estadoRevision) {
      case 'PENDIENTE': return 'Pendiente de Revisión';
      case 'RECHAZADO': return 'Rechazado';
      case 'CORREGIDO': return 'Corregido';
      case 'APROBADO': return 'Aprobado';
      default: return 'Estado Desconocido';
    }
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
      this.asuntosSeleccionados.includes(a.id) && a.estado_revision === 'APROBADO'
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
   * Abre el modal de corrección para un asunto capturado
   * @param asunto Asunto a corregir/revisar
   */
  abrirModalCorreccion(asunto: AsuntoCapturado): void {
    const dialogRef = this.dialog.open(RevisionCapturaModalComponent, {
      width: '1200px',
      maxWidth: '95vw',
      height: '90vh',
      maxHeight: '90vh',
      data: { asunto },
      disableClose: false,
      panelClass: 'revision-modal-panel'
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log('Resultado de la corrección:', resultado);
        
        // Actualizar el asunto en la lista
        const index = this.asuntosCapturados.findIndex(a => a.id === asunto.id);
        if (index !== -1) {
          // Actualizar estado según la acción realizada
          switch (resultado.accion) {
            case 'CORREGIR':
              this.asuntosCapturados[index].estado_revision = 'CORREGIDO';
              break;
            case 'APROBAR':
              this.asuntosCapturados[index].estado_revision = 'APROBADO';
              break;
            case 'RECHAZAR':
              this.asuntosCapturados[index].estado_revision = 'RECHAZADO';
              break;
          }
          
          // Recalcular estadísticas
          this.actualizarEstadisticas();
        }
      }
    });
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
      (a.personaRelacionada || '').toLowerCase().includes(textoBusqueda) ||
      a.carpeta_investigacion.toLowerCase().includes(textoBusqueda) ||
      a.usuario_captura.toLowerCase().includes(textoBusqueda) ||
      (a.tipoAsunto || '').toLowerCase().includes(textoBusqueda)
    );
  }
} 