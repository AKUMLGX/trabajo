import { Component, OnInit, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResponsablesService, FiltrosResponsable } from '../../services/responsables.service';
import { ExpedienteTlapohualli } from '../../../capture/interfaces/expediente-tlapohualli.interface';
import { ExpedienteDetalleModalComponent } from '../../../tracking/components/expediente-detalle-modal/expediente-detalle-modal.component';
import { MatDialog } from '@angular/material/dialog';

/**
 * Interfaz para el semáforo de prioridad/vencimiento
 */
export interface SemaforoPrioridad {
  nivel: 'URGENTE' | 'ALTA' | 'MEDIA' | 'BAJA' | 'VENCIDO';
  label: string;
  horas: number;
  horasRestantes: number;
  color: string;
  bgColor: string;
  borderColor: string;
  emoji: string;
}

@Component({
  selector: 'app-responsables-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIcon,
    NgxPaginationModule
  ],
  templateUrl: './responsables-table.component.html',
  styleUrl: './responsables-table.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ResponsablesTableComponent implements OnInit {
  // Referencia a Math para usar en el template
  Math = Math;
  
  // Datos
  expedientes: ExpedienteTlapohualli[] = [];
  pagesExpedientes: ExpedienteTlapohualli[][] = [];
  
  // Paginación
  pageSelected = 1;
  itemsPerPage = 20;
  
  // Filtros
  filtros: FiltrosResponsable = {};
  mostrarFiltros = false;
  
  // Estados
  cargando = false;
  mostrarTabla = false;
  
  // Estadísticas
  estadisticas = {
    total: 0,
    con_retraso: 0,
    urgentes: 0,
    por_estatus: {} as { [key: string]: number }
  };
  
  // Estadísticas de semáforo
  estadisticasSemaforo = {
    urgente: 0,
    alta: 0,
    media: 0,
    baja: 0,
    vencido: 0
  };
  
  responsable = '';
  
  // Opciones de estatus para el filtro
  opcionesEstatus = [
    { value: '', label: 'Todos' },
    { value: 'ASIGNADO', label: 'Asignado' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'ATENCION_PARCIAL', label: 'Atención Parcial' },
    { value: 'ATENCION_TOTAL', label: 'Atención Total' },
    { value: 'REVISION_LEGAL', label: 'Revisión Legal' }
  ];

  // Opciones de prioridad (semáforo) para el filtro
  opcionesPrioridad = [
    { value: '', label: 'Todas las prioridades' },
    { value: 'URGENTE', label: '🔴 Urgente (24 HRS)' },
    { value: 'ALTA', label: '🟠 Alta (72 HRS)' },
    { value: 'MEDIA', label: '🟡 Media (120 HRS)' },
    { value: 'BAJA', label: '🟢 Baja (288 HRS)' },
    { value: 'VENCIDO', label: '⚫ Vencido' }
  ];

  filtroPrioridad = '';
  
  // Labels de paginación
  labels = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente'
  };
  
  @ViewChild('sectionTable') sectionTable!: ElementRef;

  constructor(
    private responsablesService: ResponsablesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarExpedientes();
  }

  /**
   * Cargar expedientes del responsable
   */
  cargarExpedientes(): void {
    this.cargando = true;
    this.mostrarTabla = false;

    this.responsablesService.obtenerMisExpedientes(this.filtros).subscribe({
      next: (response) => {
        let expedientes = response.data || [];
        
        // Ordenar por prioridad (semáforo) - los más urgentes primero
        expedientes = this.ordenarPorPrioridad(expedientes);
        
        // Aplicar filtro de prioridad si está activo
        if (this.filtroPrioridad) {
          expedientes = expedientes.filter(exp => {
            const semaforo = this.calcularSemaforo(exp);
            return semaforo.nivel === this.filtroPrioridad;
          });
        }
        
        this.expedientes = expedientes;
        this.estadisticas = response.estadisticas;
        this.responsable = response.responsable;
        
        // Calcular estadísticas de semáforo
        this.calcularEstadisticasSemaforo();
        
        this.paginarExpedientes();
        this.mostrarTabla = true;
        this.cargando = false;
        console.log('✅ Expedientes cargados:', this.expedientes.length);
      },
      error: (error: Error) => {
        console.error('❌ Error al cargar expedientes:', error);
        this.expedientes = [];
        this.mostrarTabla = false;
        this.cargando = false;
      }
    });
  }

  /**
   * Calcular el semáforo de prioridad basado en horas desde creación
   * Reglas:
   * - Urgente: 24 HRS
   * - Alta: 72 HRS (tiempo para responder sin fecha de atención)
   * - Media: 120 HRS
   * - Baja: 288 HRS
   */
  calcularSemaforo(expediente: ExpedienteTlapohualli): SemaforoPrioridad {
    const ahora = new Date();
    // Usar fecha_creacion si existe, sino fecha_asignacion, sino fecha actual
    let fechaBase: Date;
    if (expediente.fecha_creacion) {
      fechaBase = new Date(expediente.fecha_creacion);
    } else if (expediente.fecha_asignacion) {
      fechaBase = new Date(expediente.fecha_asignacion);
    } else {
      fechaBase = new Date(); // Fallback a fecha actual
    }
    
    // Calcular horas transcurridas desde la creación/asignación
    const horasTranscurridas = Math.floor((ahora.getTime() - fechaBase.getTime()) / (1000 * 60 * 60));
    
    // Si es urgente según el plazo
    if (expediente.plazo_es_urgente) {
      const horasRestantes = 24 - horasTranscurridas;
      if (horasRestantes <= 0) {
        return {
          nivel: 'VENCIDO',
          label: 'VENCIDO',
          horas: 24,
          horasRestantes: horasRestantes,
          color: 'text-gray-800',
          bgColor: 'bg-gray-800',
          borderColor: 'border-gray-800',
          emoji: '⚫'
        };
      }
      return {
        nivel: 'URGENTE',
        label: 'Urgente',
        horas: 24,
        horasRestantes: horasRestantes,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
        emoji: '🔴'
      };
    }
    
    // Determinar nivel basado en horas transcurridas
    // Si aún no tiene fecha de atención, tiene 72 horas para responder
    const tieneFechaAtencion = expediente.fecha_atencion_inicial || expediente.fecha_estimada_atencion;
    
    // Definir umbrales en horas
    const URGENTE_HORAS = 24;
    const ALTA_HORAS = 72;
    const MEDIA_HORAS = 120;
    const BAJA_HORAS = 288;
    
    // Si no tiene fecha de atención y han pasado más de 72 horas
    if (!tieneFechaAtencion && horasTranscurridas >= ALTA_HORAS) {
      return {
        nivel: 'VENCIDO',
        label: 'VENCIDO (Sin fecha de atención)',
        horas: ALTA_HORAS,
        horasRestantes: ALTA_HORAS - horasTranscurridas,
        color: 'text-gray-800',
        bgColor: 'bg-gray-800',
        borderColor: 'border-gray-800',
        emoji: '⚫'
      };
    }
    
    // Si ha pasado el tiempo máximo (288 horas)
    if (horasTranscurridas >= BAJA_HORAS) {
      return {
        nivel: 'VENCIDO',
        label: 'VENCIDO',
        horas: BAJA_HORAS,
        horasRestantes: BAJA_HORAS - horasTranscurridas,
        color: 'text-gray-800',
        bgColor: 'bg-gray-800',
        borderColor: 'border-gray-800',
        emoji: '⚫'
      };
    }
    
    // Urgente: menos de 24 horas restantes
    if (horasTranscurridas < URGENTE_HORAS) {
      return {
        nivel: 'URGENTE',
        label: 'Urgente',
        horas: URGENTE_HORAS,
        horasRestantes: URGENTE_HORAS - horasTranscurridas,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
        emoji: '🔴'
      };
    }
    
    // Alta: entre 24 y 72 horas (tiempo para proporcionar fecha de atención)
    if (horasTranscurridas < ALTA_HORAS) {
      return {
        nivel: 'ALTA',
        label: 'Alta',
        horas: ALTA_HORAS,
        horasRestantes: ALTA_HORAS - horasTranscurridas,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-300',
        emoji: '🟠'
      };
    }
    
    // Media: entre 72 y 120 horas
    if (horasTranscurridas < MEDIA_HORAS) {
      return {
        nivel: 'MEDIA',
        label: 'Media',
        horas: MEDIA_HORAS,
        horasRestantes: MEDIA_HORAS - horasTranscurridas,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
        emoji: '🟡'
      };
    }
    
    // Baja: entre 120 y 288 horas
    return {
      nivel: 'BAJA',
      label: 'Baja',
      horas: BAJA_HORAS,
      horasRestantes: BAJA_HORAS - horasTranscurridas,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      emoji: '🟢'
    };
  }

  /**
   * Ordenar expedientes por prioridad (urgentes primero)
   */
  ordenarPorPrioridad(expedientes: ExpedienteTlapohualli[]): ExpedienteTlapohualli[] {
    const ordenPrioridad: { [key: string]: number } = {
      'VENCIDO': 0,
      'URGENTE': 1,
      'ALTA': 2,
      'MEDIA': 3,
      'BAJA': 4
    };
    
    return expedientes.sort((a, b) => {
      const semaforoA = this.calcularSemaforo(a);
      const semaforoB = this.calcularSemaforo(b);
      
      // Primero ordenar por nivel de prioridad
      const ordenA = ordenPrioridad[semaforoA.nivel] ?? 5;
      const ordenB = ordenPrioridad[semaforoB.nivel] ?? 5;
      
      if (ordenA !== ordenB) {
        return ordenA - ordenB;
      }
      
      // Si tienen el mismo nivel, ordenar por horas restantes (menos horas primero)
      return semaforoA.horasRestantes - semaforoB.horasRestantes;
    });
  }

  /**
   * Calcular estadísticas de semáforo
   */
  calcularEstadisticasSemaforo(): void {
    this.estadisticasSemaforo = {
      urgente: 0,
      alta: 0,
      media: 0,
      baja: 0,
      vencido: 0
    };
    
    this.expedientes.forEach(exp => {
      const semaforo = this.calcularSemaforo(exp);
      switch (semaforo.nivel) {
        case 'URGENTE':
          this.estadisticasSemaforo.urgente++;
          break;
        case 'ALTA':
          this.estadisticasSemaforo.alta++;
          break;
        case 'MEDIA':
          this.estadisticasSemaforo.media++;
          break;
        case 'BAJA':
          this.estadisticasSemaforo.baja++;
          break;
        case 'VENCIDO':
          this.estadisticasSemaforo.vencido++;
          break;
      }
    });
  }

  /**
   * Formatear horas restantes a texto legible
   */
  formatearHorasRestantes(horas: number): string {
    if (horas <= 0) {
      return 'Vencido';
    }
    if (horas < 24) {
      return `${horas}h restantes`;
    }
    const dias = Math.floor(horas / 24);
    const horasRestantes = horas % 24;
    if (horasRestantes === 0) {
      return `${dias}d restantes`;
    }
    return `${dias}d ${horasRestantes}h restantes`;
  }

  /**
   * Paginar expedientes
   */
  paginarExpedientes(): void {
    this.pagesExpedientes = [];
    for (let i = 0; i < this.expedientes.length; i += this.itemsPerPage) {
      this.pagesExpedientes.push(this.expedientes.slice(i, i + this.itemsPerPage));
    }
    // Asegurar que pageSelected esté en rango válido
    if (this.pageSelected > this.pagesExpedientes.length) {
      this.pageSelected = 1;
    }
  }

  /**
   * Aplicar filtros
   */
  aplicarFiltros(): void {
    this.pageSelected = 1;
    this.cargarExpedientes();
  }

  /**
   * Limpiar filtros
   */
  limpiarFiltros(): void {
    this.filtros = {};
    this.filtroPrioridad = '';
    this.aplicarFiltros();
  }

  /**
   * Ver detalle de expediente
   */
  verDetalleExpediente(expediente: ExpedienteTlapohualli): void {
    const dialogRef = this.dialog.open(ExpedienteDetalleModalComponent, {
      width: '90%',
      maxWidth: '1200px',
      data: { expediente }
    });

    dialogRef.afterClosed().subscribe(() => {
      // Recargar expedientes después de cerrar el modal (por si se actualizó algo)
      this.cargarExpedientes();
    });
  }

  /**
   * Formatear fecha
   */
  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return '-';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return '-';
    }
  }

  /**
   * Formatear fecha y hora
   */
  formatearFechaHora(fecha: string | null | undefined): string {
    if (!fecha) return '-';
    try {
      const date = new Date(fecha);
      return date.toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  }

  /**
   * Scroll a la tabla
   */
  scrollToTable(): void {
    if (this.sectionTable) {
      this.sectionTable.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
