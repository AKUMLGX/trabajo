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
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { AsuntosPendientesTableComponent } from './components/asuntos-pendientes-table/asuntos-pendientes-table.component';
import { AsuntosRevisadosTableComponent } from './components/asuntos-revisados-table/asuntos-revisados-table.component';
import { RevisionDetalleModalComponent } from './components/revision-detalle-modal/revision-detalle-modal.component';
import { RevisionCapturaModalComponent } from './components/revision-captura-modal/revision-captura-modal.component';

// 🆕 Importar servicio e interfaces
import { CardsInfoBandejadeAtencionService } from '../../../services/cards-info-bandejade-atencion.service';
import { AsuntoPorEstadoAtencionRequest, AsuntoAsignacion } from '../../../interfaces/asuntoPorAtencion.interface';
import { ArchivosAtencionService } from '../../../services/archivos-atencion.service';

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
  folio_interno: string; // Folio interno (NO editable)
  
  // ✅ Campos editables
  oficio?: string;
  folioScanner?: string;
  carpeta_investigacion: string;
  fechaRecepcion?: string;
  autoridad_remitente: string;
  personaRelacionada?: string;
  turnoJefatura?: string;
  administracion?: string;
  descripcion: string; // Descripción del asunto
  
  // Plazo de atención
  plazoCantidad?: number;
  plazoUnidad?: 'DIAS' | 'SEMANAS' | 'MESES';
  plazo_atencion?: number; // Campo del JSON
  plazoAtencion?: string; // Plazo formateado (para compatibilidad)
  esUrgente?: boolean;
  
  // Tipos requeridos
  tipoDocumento?: string;
  tipoAtencion?: string;
  
  // Metadatos de captura
  fecha_captura: string;
  usuario_captura: string;
  estado_revision: 'PENDIENTE' | 'APROBADO';
  documento_pdf?: string;
  fecha_limite?: string;
  prioridad?: 'ALTA' | 'MEDIA' | 'BAJA';
  
  // Campos adicionales para la tabla
  tieneDocumentos?: boolean;
  cantidadDocumentos?: number;
  erroresDetectados?: string[];
  
  // Campos antiguos para compatibilidad
  folio?: string; // Alias de folio_interno
  asunto?: string; // Alias de descripcion
  autoridad_solicitante?: string; // Alias de autoridad_remitente
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

  // 🆕 Filtros específicos para asuntos capturados
  filtroEstadoCaptura: 'TODOS' | 'PENDIENTE' | 'APROBADO' = 'TODOS';
  filtroAutoridadRemitente = 'Todas';
  filtroFechaRecepcion = '';
  filtroPlazoAtencion = 'Todos';

  // Propiedades para la vista de asuntos pendientes
  vistaPendientes = 'tabla'; // 'tabla', 'grid' o 'kanban'

  // 🎭 Control de pestaña activa para dashboard dinámico
  tabActiva: 'capturados' | 'dictamenes' | 'revisados' = 'capturados';

  // 🆕 PROPIEDADES SENCILLAS PARA PAGINACIÓN
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  asuntosPaginados: AsuntoCapturado[] = [];

  constructor(
    private dialog: MatDialog,
    private cardsService: CardsInfoBandejadeAtencionService,
    private archivosAtencionService: ArchivosAtencionService,
    private domSanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Cargar datos de ejemplo
    this.cargarDatosEjemplo();
    this.cargarAsuntosCapturados(); // 🆕 Cargar asuntos capturados
    this.actualizarEstadisticas();
  }

  cargarDatosEjemplo(): void {
    // Datos de ejemplo para dictámenes (no para asuntos capturados)
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

  // Método para cargar asuntos capturados desde el endpoint
  cargarAsuntosCapturados(): void {
    const request: AsuntoPorEstadoAtencionRequest = {
      documento: "REQUERIMIENTO",
      estado_atencion: "POR ASIGNAR"
    };

    this.cardsService.getAsuntosPorEstadoAtencion(request).subscribe({
      next: (response) => {
        console.log(`✅ ${response?.length || 0} asuntos cargados`);
        
        if (response && response.length > 0) {
          // Transformar datos del backend al formato de la interfaz del frontend
          this.asuntosCapturados = response.map((item: AsuntoAsignacion, index: number) => {
            let asuntoData: any = {};
            
            // Extraer datos según la estructura anidada del backend
            if ('tipo' in item.asunto && 'datos' in item.asunto) {
              // Nueva estructura: { tipo: "Nuevo"|"Historico", datos: {...} }
              asuntoData = item.asunto.datos;
            } else if ('Nuevo' in item.asunto && item.asunto.Nuevo) {
              // Estructura legacy: { Nuevo: {...} }
              asuntoData = item.asunto.Nuevo;
            } else if ('Historico' in item.asunto && item.asunto.Historico) {
              // Estructura legacy: { Historico: {...} }
              asuntoData = item.asunto.Historico;
            } else {
              console.warn('⚠️ Estructura de asunto no reconocida:', item.asunto);
              return null;
            }

            // Verificar que tenemos datos válidos
            if (!asuntoData || !asuntoData.folio_interno) {
              console.warn('⚠️ Asunto sin folio_interno, omitiendo:', asuntoData);
              return null;
            }

            const asuntoCapturado: AsuntoCapturado = {
              id: `CAP-${asuntoData.id_asunto_nuevo || asuntoData.id_asunto_historico || index + 1}`,
              folio_interno: asuntoData.folio_interno || `N/A-${index + 1}`,
              folio: asuntoData.folio_interno || `N/A-${index + 1}`, // Para compatibilidad
              fecha_captura: asuntoData.fecha_captura || new Date().toISOString(),
              fechaRecepcion: asuntoData.fecha_recepcion || new Date().toISOString().split('T')[0],
              usuario_captura: item.rfc_asignado || 'Sistema Akamba Real',
              estado_revision: 'PENDIENTE', // Estado mapeado al formato del frontend
              personaRelacionada: asuntoData.persona_relacionada || 'No especificado',
              carpeta_investigacion: asuntoData.carpeta_investigacion || 'Sin carpeta',
              autoridad_remitente: asuntoData.autoridad_remitente || 'No especificado',
              autoridad_solicitante: asuntoData.autoridad_remitente || 'No especificado', // Para compatibilidad
              descripcion: asuntoData.descripcion || 'Sin descripción',
              asunto: asuntoData.descripcion || 'Sin descripción', // Para compatibilidad
              oficio: asuntoData.oficio || 'Sin oficio',
              plazo_atencion: asuntoData.plazo_atencion,
              plazoAtencion: asuntoData.plazo_atencion ? `${asuntoData.plazo_atencion} días` : 'No definido',
              prioridad: 'MEDIA', // Valor por defecto, se puede ajustar según lógica de negocio
              tieneDocumentos: Boolean(asuntoData.documento_escaneado),
              cantidadDocumentos: asuntoData.documento_escaneado ? 1 : 0,
              erroresDetectados: [] // Se puede implementar validación posterior
            };

            // GUARDAR EL JSON ORIGINAL como propiedad adicional
            (asuntoCapturado as any).jsonOriginal = item;

            return asuntoCapturado;
          }).filter((item): item is AsuntoCapturado => item !== null); // Filtrar elementos nulos con type guard

          this.actualizarEstadisticas();
          this.calcularPaginacion();
        } else {
          console.log('⚠️ No se encontraron asuntos');
          this.asuntosCapturados = [];
          this.actualizarEstadisticas();
          this.calcularPaginacion();
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar asuntos:', error);
        this.asuntosCapturados = [];
        this.actualizarEstadisticas();
        this.calcularPaginacion();
      }
    });
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
      a.estado_revision === 'PENDIENTE').length;
    
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
   * Verifica si todos los asuntos aprobados están seleccionados
   * @returns true si todos están seleccionados
   */
  todosAprobadosSeleccionados(): boolean {
    const asuntosAprobados = this.getAsuntosCapturasFiltrados().filter(a => a.estado_revision === 'APROBADO');
    return asuntosAprobados.length > 0 && asuntosAprobados.every(a => this.isAsuntoSeleccionado(a.id));
  }

  /**
   * Verifica si algunos asuntos aprobados están seleccionados
   * @returns true si algunos están seleccionados
   */
  algunosAprobadosSeleccionados(): boolean {
    const asuntosAprobados = this.getAsuntosCapturasFiltrados().filter(a => a.estado_revision === 'APROBADO');
    return asuntosAprobados.some(a => this.isAsuntoSeleccionado(a.id));
  }

  /**
   * Selecciona o deselecciona todos los asuntos aprobados visibles
   */
  toggleTodosAprobados(event: any): void {
    const asuntosAprobados = this.getAsuntosCapturasFiltrados().filter(a => a.estado_revision === 'APROBADO');
    const todosSeleccionados = this.todosAprobadosSeleccionados();
    
    if (todosSeleccionados) {
      // Deseleccionar todos los aprobados
      asuntosAprobados.forEach(a => {
        const index = this.asuntosSeleccionados.indexOf(a.id);
        if (index > -1) {
          this.asuntosSeleccionados.splice(index, 1);
        }
      });
    } else {
      // Seleccionar todos los aprobados
      asuntosAprobados.forEach(a => {
        if (!this.isAsuntoSeleccionado(a.id)) {
          this.asuntosSeleccionados.push(a.id);
        }
      });
    }
  }

  /**
   * Obtiene el color del estado de revisión
   * @param estadoRevision Estado del asunto capturado
   * @returns Clase CSS para el color
   */
  getColorEstadoCaptura(estadoRevision: string): string {
    switch (estadoRevision) {
      case 'PENDIENTE': return 'bg-sky-500 text-white';
      case 'APROBADO': return 'bg-emerald-500 text-white';
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
      case 'APROBADO': return 'Aprobado para Akamba 3';
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
   * Envía asuntos seleccionados directamente a la administración sin aprobación previa
   * Usa el endpoint /asunto/atencion/asignar_administracion
   */
  asignarAsuntosDirectamente(): void {
    if (this.asuntosSeleccionados.length === 0) {
      alert('Por favor seleccione al menos un asunto para asignar');
      return;
    }

    const asuntosParaAsignar = this.asuntosCapturados.filter(a => 
      this.asuntosSeleccionados.includes(a.id)
    );

    const confirmacion = confirm(
      `¿Está seguro de asignar ${asuntosParaAsignar.length} asunto(s) directamente a la administración?\n\n` +
      `Nota: Los asuntos se enviarán sin requerir aprobación previa.`
    );

    if (confirmacion) {
      let asignacionesExitosas = 0;
      let errores: string[] = [];

      // Procesar cada asunto seleccionado
      asuntosParaAsignar.forEach(asunto => {
        // Recuperar el JSON original que guardamos anteriormente
        const jsonOriginal = (asunto as any).jsonOriginal;
        
        if (jsonOriginal) {
          // Preparar el objeto para el endpoint según la estructura requerida
          const asuntoParaEnviar = {
            asunto: jsonOriginal.asunto,
            tipo_asunto: jsonOriginal.tipo_asunto.toLowerCase(), // Convertir a minúsculas
            rfc_asignado: jsonOriginal.rfc_asignado || "", // DEBE ser string, no null
            id_asignacion: jsonOriginal.id_asignacion || null
          };

          console.log('📤 Enviando asunto para asignación:', asuntoParaEnviar);

          this.cardsService.asignarAsuntoAdministracion(asuntoParaEnviar).subscribe({
            next: (response) => {
              console.log('✅ Asunto asignado exitosamente:', response);
              asignacionesExitosas++;
              
              // Si es el último asunto procesado, mostrar resultado
              if (asignacionesExitosas + errores.length === asuntosParaAsignar.length) {
                this.mostrarResultadoAsignacion(asignacionesExitosas, errores);
              }
            },
            error: (error) => {
              console.error('❌ Error al asignar asunto:', error);
              errores.push(`${asunto.folio_interno}: ${error.error || 'Error desconocido'}`);
              
              // Si es el último asunto procesado, mostrar resultado
              if (asignacionesExitosas + errores.length === asuntosParaAsignar.length) {
                this.mostrarResultadoAsignacion(asignacionesExitosas, errores);
              }
            }
          });
        } else {
          console.error('⚠️ No se encontró JSON original para el asunto:', asunto);
          errores.push(`${asunto.folio_interno}: Datos incompletos`);
        }
      });
    }
  }

  /**
   * Muestra el resultado de la asignación masiva
   */
  private mostrarResultadoAsignacion(exitosas: number, errores: string[]): void {
    let mensaje = `✅ Se asignaron ${exitosas} asunto(s) exitosamente.`;
    
    if (errores.length > 0) {
      mensaje += `\n\n❌ Errores en ${errores.length} asunto(s):\n`;
      mensaje += errores.join('\n');
    }
    
    alert(mensaje);
    
    // Limpiar selección y recargar datos
    this.asuntosSeleccionados = [];
    this.cargarAsuntosCapturados();
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
              this.asuntosCapturados[index].estado_revision = 'PENDIENTE';
              break;
            case 'APROBAR':
              this.asuntosCapturados[index].estado_revision = 'APROBADO';
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
    console.log('🔍 getAsuntosCapturasFiltrados() ejecutado');
    console.log('📊 this.asuntosCapturados.length:', this.asuntosCapturados.length);
    console.log('📋 this.asuntosCapturados:', this.asuntosCapturados);
    
    let asuntosFiltrados = [...this.asuntosCapturados];
    console.log('📝 Antes de filtros - asuntosFiltrados.length:', asuntosFiltrados.length);
    
    // Filtrar por texto
    if (this.filtroText) {
      console.log('🔎 Filtrando por texto:', this.filtroText);
      const textoBusqueda = this.filtroText.toLowerCase();
      asuntosFiltrados = asuntosFiltrados.filter(a => 
        (a.folio_interno || '').toLowerCase().includes(textoBusqueda) ||
        (a.personaRelacionada || '').toLowerCase().includes(textoBusqueda) ||
        (a.carpeta_investigacion || '').toLowerCase().includes(textoBusqueda) ||
        (a.oficio || '').toLowerCase().includes(textoBusqueda) ||
        (a.usuario_captura || '').toLowerCase().includes(textoBusqueda)
      );
      console.log('📝 Después de filtro texto - asuntosFiltrados.length:', asuntosFiltrados.length);
    }
    
    // Filtrar por estado de revisión
    if (this.filtroEstadoCaptura !== 'TODOS') {
      console.log('📋 Filtrando por estado:', this.filtroEstadoCaptura);
      asuntosFiltrados = asuntosFiltrados.filter(a => a.estado_revision === this.filtroEstadoCaptura);
      console.log('📝 Después de filtro estado - asuntosFiltrados.length:', asuntosFiltrados.length);
    }
    
    // Filtrar por autoridad remitente
    if (this.filtroAutoridadRemitente !== 'Todas') {
      console.log('🏛️ Filtrando por autoridad:', this.filtroAutoridadRemitente);
      asuntosFiltrados = asuntosFiltrados.filter(a => a.autoridad_remitente === this.filtroAutoridadRemitente);
      console.log('📝 Después de filtro autoridad - asuntosFiltrados.length:', asuntosFiltrados.length);
    }
    
    console.log('✅ getAsuntosCapturasFiltrados() resultado final:', asuntosFiltrados.length, 'asuntos');
    console.log('📋 Asuntos filtrados:', asuntosFiltrados);
    return asuntosFiltrados;
  }

  // 🆕 MÉTODOS SENCILLOS PARA PAGINACIÓN
  calcularPaginacion(): void {
    const asuntosFiltrados = this.getAsuntosCapturasFiltrados();
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.asuntosPaginados = asuntosFiltrados.slice(inicio, fin);
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.calcularPaginacion();
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.cambiarPagina(this.paginaActual - 1);
    }
  }

  paginaSiguiente(): void {
    const totalPaginas = Math.ceil(this.getAsuntosCapturasFiltrados().length / this.itemsPorPagina);
    if (this.paginaActual < totalPaginas) {
      this.cambiarPagina(this.paginaActual + 1);
    }
  }

  cambiarItemsPorPagina(nuevoValor: number): void {
    this.itemsPorPagina = nuevoValor;
    this.paginaActual = 1;
    this.calcularPaginacion();
  }

  obtenerTotalPaginas(): number {
    return Math.ceil(this.getAsuntosCapturasFiltrados().length / this.itemsPorPagina);
  }

  // 🆕 MÉTODO PARA TRUNCAR TEXTO LARGO
  truncarTexto(texto: string, longitud: number = 50): string {
    if (!texto) return '';
    if (texto.length <= longitud) return texto;
    return texto.substring(0, longitud) + '...';
  }

  // 🆕 MÉTODO PARA OBTENER TEXTO COMPLETO PARA TOOLTIP
  obtenerTextoCompleto(texto: string): string {
    return texto || '';
  }

  // 🆕 MÉTODO PARA INTERPRETAR PLAZO DE ATENCIÓN
  interpretarPlazoAtencion(plazo: number | null): string {
    if (plazo === null || plazo === undefined) {
      return 'Sin plazo definido';
    }
    
    if (plazo === 0) {
      return 'Urgente';
    }
    
    if (plazo >= 1 && plazo <= 5) {
      return `${plazo} día${plazo > 1 ? 's' : ''}`;
    }
    
    return `${plazo} días`;
  }

  // 🆕 MÉTODO PARA OBTENER CLASE CSS DEL PLAZO
  obtenerClasePlazo(plazo: number | null): string {
    if (plazo === null || plazo === undefined) {
      return 'bg-gray-100 text-gray-700';
    }
    
    if (plazo === 0) {
      return 'bg-red-100 text-red-700';
    }
    
    if (plazo <= 2) {
      return 'bg-orange-100 text-orange-700';
    }
    
    return 'bg-green-100 text-green-700';
  }

  // 🆕 MÉTODOS PARA PRIMERA Y ÚLTIMA PÁGINA
  primeraPagina(): void {
    this.cambiarPagina(1);
  }

  ultimaPagina(): void {
    this.cambiarPagina(this.obtenerTotalPaginas());
  }

  // 🆕 MÉTODO PARA OBTENER RANGO DE PÁGINAS VISIBLES
  obtenerRangoPaginas(): number[] {
    const totalPaginas = this.obtenerTotalPaginas();
    const paginas: number[] = [];
    
    // Mostrar máximo 5 páginas alrededor de la actual
    const inicio = Math.max(1, this.paginaActual - 2);
    const fin = Math.min(totalPaginas, this.paginaActual + 2);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }

  // 🆕 NUEVOS MÉTODOS PARA ESTADÍSTICAS Y FILTROS

  /**
   * Aplica filtros rápidos desde las tarjetas de estadísticas
   */
  aplicarFiltroRapido(tipo: string): void {
    switch (tipo) {
      case 'capturados':
        this.filtroEstadoCaptura = 'TODOS';
        break;
      case 'pendientes':
        this.filtroEstadoCaptura = 'PENDIENTE';
        break;
      case 'aprobados':
        this.filtroEstadoCaptura = 'APROBADO';
        break;
    }
  }

  /**
   * Obtiene el número de asuntos pendientes de revisión
   */
  getPendientesRevision(): number {
    return this.asuntosCapturados.filter(a => a.estado_revision === 'PENDIENTE').length;
  }

  /**
   * Obtiene el número de asuntos revisados hoy
   */
  getRevisadosHoy(): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    return this.asuntosCapturados.filter(a => {
      const fechaCaptura = new Date(a.fecha_captura);
      fechaCaptura.setHours(0, 0, 0, 0);
      return fechaCaptura.getTime() === hoy.getTime() && a.estado_revision !== 'PENDIENTE';
    }).length;
  }

  /**
   * Obtiene la meta diaria de revisiones
   */
  getMeta(): number {
    return 15; // Meta diaria configurable
  }

  /**
   * Calcula el progreso del día en porcentaje
   */
  getProgresoDelDia(): number {
    const revisados = this.getRevisadosHoy();
    const meta = this.getMeta();
    return Math.min(Math.round((revisados / meta) * 100), 100);
  }

  /**
   * Obtiene el tiempo promedio de revisión
   */
  getTiempoPromedio(): string {
    return '8.5'; // Simulado - en una implementación real vendría del backend
  }

  /**
   * Obtiene el porcentaje de calidad de revisión
   */
  getCalidadRevision(): number {
    return 94; // Simulado - basado en revisiones sin errores
  }

  /**
   * Obtiene el número de estrellas para calidad
   */
  getEstrellas(): number {
    const calidad = this.getCalidadRevision();
    if (calidad >= 95) return 5;
    if (calidad >= 90) return 4;
    if (calidad >= 80) return 3;
    if (calidad >= 70) return 2;
    return 1;
  }

  /**
   * Limpia todos los filtros aplicados
   */
  limpiarFiltros(): void {
    this.filtroText = '';
    this.filtroEstadoCaptura = 'TODOS';
    this.filtroAutoridadRemitente = 'Todas';
    this.filtroPrioridad = 'Todas';
    this.filtroFechaRecepcion = '';
    this.filtroPlazoAtencion = 'Todos';
  }

  /**
   * Verifica si hay filtros activos
   */
  tienesFiltrosActivos(): boolean {
    return this.filtroText !== '' ||
           this.filtroEstadoCaptura !== 'TODOS' ||
           this.filtroAutoridadRemitente !== 'Todas' ||
           this.filtroPrioridad !== 'Todas' ||
           this.filtroFechaRecepcion !== '' ||
           this.filtroPlazoAtencion !== 'Todos';
  }

  /**
   * Obtiene la hora de captura formateada
   */
  getHoraCaptura(fechaCaptura: string): string {
    const fecha = new Date(fechaCaptura);
    return fecha.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }

  /**
   * Abre el modal de revisión de captura
   */
  abrirModalRevisionCaptura(asunto: AsuntoCapturado): void {
    // 🆕 Buscar el JSON original del backend
    const jsonOriginal = (asunto as any).jsonOriginal;
    
    console.log('🔧 ABRIENDO MODAL CON:');
    console.log('📄 Asunto transformado:', asunto);
    console.log('📦 JSON Original:', jsonOriginal);
    console.log('🔍 ¿Tiene JSON original?', !!jsonOriginal);
    
    const dialogRef = this.dialog.open(RevisionCapturaModalComponent, {
      width: '1200px',
      maxWidth: '95vw',
      height: 'auto',
      maxHeight: '90vh',
      disableClose: false,
      data: {
        asunto: asunto,
        modo: asunto.estado_revision === 'PENDIENTE' ? 'REVISION' : 'EDICION',
        // 🆕 Pasar el JSON original del backend
        jsonOriginal: jsonOriginal
      },
      panelClass: ['custom-dialog-container']
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log('Resultado de la revisión:', resultado);
        
        // Actualizar el asunto en la lista
        const index = this.asuntosCapturados.findIndex(a => a.id === asunto.id);
        if (index !== -1) {
          // Actualizar estado según la acción realizada
          switch (resultado.accion) {
            case 'CORREGIR':
              this.asuntosCapturados[index].estado_revision = 'PENDIENTE';
              break;
            case 'APROBAR':
              this.asuntosCapturados[index].estado_revision = 'APROBADO';
              break;
          }
          
          // Recalcular estadísticas
          this.actualizarEstadisticas();
        }
      }
    });
  }

  /**
   * Asigna un asunto individual directamente a la administración
   * sin requerir aprobación previa
   */
  asignarAsuntoIndividual(asunto: AsuntoCapturado): void {
    const confirmacion = confirm(
      `¿Está seguro de asignar el asunto ${asunto.folio_interno} directamente a la administración?\n\n` +
      `Nota: El asunto se enviará sin requerir aprobación previa.`
    );

    if (confirmacion) {
      let asuntoParaEnviar: any;
      
      // Recuperar el JSON original
      const jsonOriginal = (asunto as any).jsonOriginal;
      
      if (jsonOriginal) {
        // IMPORTANTE: El backend espera rfc_asignado como String, NO puede ser null
        asuntoParaEnviar = {
          asunto: jsonOriginal.asunto,
          tipo_asunto: jsonOriginal.tipo_asunto.toLowerCase(), // Convertir a minúsculas
          rfc_asignado: jsonOriginal.rfc_asignado || "", // DEBE ser string, usar vacío si es null
          id_asignacion: jsonOriginal.id_asignacion || null
        };

        console.log('📤 Enviando asunto:', asuntoParaEnviar);
      } else {
        console.error('❌ No hay JSON original disponible');
        alert('⚠️ No se puede asignar este asunto porque no contiene los datos necesarios del servidor.');
        return;
      }

      // Enviar el asunto (ya sea con JSON original o temporal)
      this.cardsService.asignarAsuntoAdministracion(asuntoParaEnviar).subscribe({
        next: (response) => {
          console.log('✅ Asunto asignado exitosamente:', response);
          alert(`✅ El asunto ${asunto.folio_interno} fue asignado exitosamente.`);
          
          // Recargar la lista
          this.cargarAsuntosCapturados();
        },
        error: (error) => {
          console.error('❌ Error al asignar asunto:', error);
          alert(`❌ Error al asignar el asunto: ${error.error || 'Error desconocido'}`);
        }
      });
    }
  }

  /**
   * Obtiene la timestamp de última actualización
   */
  getUltimaActualizacion(): string {
    const ahora = new Date();
    return ahora.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }

  /**
   * Obtiene los asuntos que están seleccionados actualmente
   * @returns Array de asuntos seleccionados
   */
  getAsuntosSeleccionados(): AsuntoCapturado[] {
    return this.asuntosCapturados.filter(a => this.asuntosSeleccionados.includes(a.id));
  }

  /**
   * Limpia toda la selección de asuntos
   */
  limpiarSeleccion(): void {
    this.asuntosSeleccionados = [];
  }

  /**
   * Calcula el porcentaje de procesamiento de asuntos
   * @returns Porcentaje redondeado de asuntos procesados
   */
  getPorcentajeProcesamiento(): number {
    if (this.asuntosCapturados.length === 0) return 0;
    return Math.round((this.estadisticas.listosParaEnviar / this.asuntosCapturados.length) * 100);
  }

  /**
   * Cambia la pestaña activa y actualiza el dashboard
   */
  cambiarTab(tab: 'capturados' | 'dictamenes' | 'revisados'): void {
    this.tabActiva = tab;
    console.log('🔄 Pestaña cambiada a:', tab);
    
    // 🆕 Cargar datos automáticamente cuando se activa la pestaña de capturados
    if (tab === 'capturados') {
      console.log('📋 Cargando asuntos capturados automáticamente...');
      this.cargarAsuntosCapturados();
    }
  }

  // 📊 MÉTRICAS PARA DICTÁMENES PENDIENTES
  getDictamenesPendientes(): number {
    return this.asuntosPendientes.length;
  }

  getDictamenesEnProceso(): number {
    return Math.floor(this.asuntosPendientes.length * 0.3); // 30% en proceso
  }

  getDictamenesCompletados(): number {
    return Math.floor(this.asuntosPendientes.length * 0.6); // 60% completados
  }

  getTiempoPromedioDictamen(): string {
    return "12.3"; // minutos promedio
  }

  // 📚 MÉTRICAS PARA ASUNTOS REVISADOS (HISTÓRICO)
  getTotalRevisados(): number {
    return this.asuntosRevisados.length;
  }

  getRevisadosHoyHistorico(): number {
    return Math.floor(this.asuntosRevisados.length * 0.1); // 10% de hoy
  }

  getRevisadosEstaSemana(): number {
    return Math.floor(this.asuntosRevisados.length * 0.3); // 30% esta semana
  }

  getPromedioCalidad(): number {
    return 92; // Porcentaje de calidad promedio
  }

  getRevisorMasProductivo(): string {
    return "Ana Martínez";
  }

  /**
   * Maneja el cambio de pestañas y actualiza el dashboard
   */
  onTabChange(event: any): void {
    const tabIndex = event.index;
    switch (tabIndex) {
      case 0:
        this.cambiarTab('capturados');
        break;
      case 1:
        this.cambiarTab('dictamenes');
        break;
      case 2:
        this.cambiarTab('revisados');
        break;
      default:
        this.cambiarTab('capturados');
    }
  }

  // ✅ Variables para funcionalidad PDF Viewer
  visualizarPdf: boolean = false;
  pdfUrl: SafeResourceUrl | null = null;
  pdfCargando: boolean = false;
  pdfError: boolean = false;
  pdfTitulo: string = '';

  // ✅ MÉTODOS PARA FUNCIONALIDAD PDF VIEWER

  /**
   * Abre el visualizador de PDF para un asunto específico
   * @param folio - Folio interno del asunto
   * @param path - Path o número del archivo escaneado
   */
  openPdfViewer(folio: string, path: number): void {
    console.log('🔍 [RevisionFinal] openPdfViewer INICIADO');
    console.log('🔍 [RevisionFinal] Parámetros recibidos:', { folio, path });

    if (folio == null) {
      folio = "sinAsignar";
      console.log('🔍 [RevisionFinal] Folio era null, cambiado a:', folio);
    }

    this.pdfCargando = true;
    this.pdfError = false;
    this.pdfUrl = null;
    this.pdfTitulo = `Documento ${folio}`;

    // Primero intentar listar archivos reales del folio
    console.log('🔍 [RevisionFinal] Intentando listar archivos reales para:', folio);

    this.archivosAtencionService.listarArchivosPdfAtencion(folio).subscribe({
      next: (archivos: any[]) => {
        console.log('🔍 [RevisionFinal] Archivos encontrados:', archivos);

        if (archivos && archivos.length > 0) {
          // Usar el primer archivo PDF encontrado
          const primerArchivo = archivos[0];
          const nombreArchivo = primerArchivo.nombre || primerArchivo.name;

          console.log('✅ [RevisionFinal] Usando archivo real encontrado:', nombreArchivo);
          this.cargarPdfDirecto(folio, nombreArchivo);
        } else {
          console.log('⚠️ [RevisionFinal] No se encontraron archivos, usando lista de nombres posibles');
          this.probarArchivosPorNombre(folio, path);
        }
      },
      error: (error: any) => {
        console.log('⚠️ [RevisionFinal] Error al listar archivos, usando lista de nombres posibles:', error.status);
        this.probarArchivosPorNombre(folio, path);
      }
    });
  }

  private probarArchivosPorNombre(folio: string, path: number): void {
    // Lista de nombres de archivo posibles a probar (basada en patrones reales del sistema)
    const nombresArchivoPosibles = [
      'acta_compressed.pdf',
      '59680.pdf',
      `${path}.pdf`,
      'documento_compressed.pdf',
      'archivo_compressed.pdf',
      'acta.pdf',
      'documento.pdf',
      'archivo.pdf',
      'documento_escaneado.pdf',
      'archivo_escaneado.pdf',
      'acta_escaneada.pdf',
      `documento_${path}.pdf`,
      `archivo_${path}.pdf`,
      'oficio.pdf',
      'requerimiento.pdf',
      'solicitud.pdf',
      'ComprobanteNomina00000200940.pdf',
      'GUIA_SINIESTRO_0163194079A.pdf',
      'Mnuta_akamba_v1_06022025.pdf'
    ];

    console.log('🔍 [RevisionFinal] Probando nombres de archivo:', nombresArchivoPosibles);
    this.probarArchivos(folio, nombresArchivoPosibles, 0);
  }

  private cargarPdfDirecto(folio: string, nombreArchivo: string): void {
    console.log(`🔍 [RevisionFinal] Cargando PDF directamente: ${nombreArchivo}`);

    this.archivosAtencionService.obtenerPdf(folio, nombreArchivo).subscribe({
      next: (data: string) => {
        if (!data || data.trim() === '') {
          console.log(`⚠️ [RevisionFinal] Archivo ${nombreArchivo} vacío`);
          this.pdfError = true;
          this.pdfCargando = false;
          return;
        }

        console.log(`✅ [RevisionFinal] Archivo ${nombreArchivo} cargado exitosamente`);

        try {
          const pdfSrc = `data:application/pdf;base64,${data}`;
          this.pdfUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(pdfSrc);
          this.visualizarPdf = true;
          this.pdfCargando = false;
        } catch (error) {
          console.error('❌ [RevisionFinal] Error al procesar el PDF:', error);
          this.pdfError = true;
          this.pdfCargando = false;
        }
      },
      error: (error: any) => {
        console.error(`❌ [RevisionFinal] Error al cargar PDF directo ${nombreArchivo}:`, error);
        this.pdfError = true;
        this.pdfCargando = false;
      }
    });
  }

  private probarArchivos(folio: string, nombresArchivos: string[], indice: number): void {
    if (indice >= nombresArchivos.length) {
      console.log('❌ [RevisionFinal] No se pudo cargar ningún archivo PDF');
      this.pdfError = true;
      this.pdfCargando = false;
      return;
    }

    const nombreArchivo = nombresArchivos[indice];
    console.log(`🔍 [RevisionFinal] Probando archivo ${indice + 1}/${nombresArchivos.length}: ${nombreArchivo}`);

    this.archivosAtencionService.obtenerPdf(folio, nombreArchivo).subscribe({
      next: (data: string) => {
        if (!data || data.trim() === '') {
          console.log(`⚠️ [RevisionFinal] Archivo ${nombreArchivo} vacío, probando siguiente...`);
          this.probarArchivos(folio, nombresArchivos, indice + 1);
          return;
        }

        console.log(`✅ [RevisionFinal] Archivo ${nombreArchivo} encontrado y cargado exitosamente`);

        try {
          const pdfSrc = `data:application/pdf;base64,${data}`;
          this.pdfUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(pdfSrc);
          this.visualizarPdf = true;
          this.pdfCargando = false;
        } catch (error) {
          console.error('❌ [RevisionFinal] Error al procesar el PDF:', error);
          this.probarArchivos(folio, nombresArchivos, indice + 1);
        }
      },
      error: (error: any) => {
        console.log(`⚠️ [RevisionFinal] Error al cargar ${nombreArchivo}, probando siguiente...`);
        this.probarArchivos(folio, nombresArchivos, indice + 1);
      }
    });
  }

  /**
   * Abre el modal de visualización de PDF
   */
  abrirModalPDF(): void {
    this.visualizarPdf = true;
  }

  /**
   * Cierra el visualizador de PDF
   */
  cerrarVisualizador(): void {
    this.visualizarPdf = false;
    this.pdfUrl = null;
    this.pdfCargando = false;
    this.pdfError = false;
    this.pdfTitulo = '';
  }
} 