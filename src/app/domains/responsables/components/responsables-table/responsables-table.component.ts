import { Component, OnInit, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResponsablesService, FiltrosResponsable } from '../../services/responsables.service';
import { AtencionService, AtencionConEspecialistas } from '../../services/atencion.service';
import { ExpedienteTlalcalli } from '../../../capture/interfaces/expediente-tlalcalli.interface';
import { ExpedienteDetalleModalComponent } from '../../../tracking/components/expediente-detalle-modal/expediente-detalle-modal.component';
import { AtencionModalComponent } from '../atencion-modal/atencion-modal.component';
import { MatDialog } from '@angular/material/dialog';

/**
 * Interfaz para el semáforo de prioridad basado en TIEMPO TRANSCURRIDO
 * 
 * REGLAS DEL SEMÁFORO (desde captura del asunto):
 * - 🟢 EN TIEMPO (0-24h): Recién capturado, todo bien
 * - 🟡 ATENCIÓN (24-48h): Ya lleva tiempo, prestar atención
 * - 🔴 URGENTE (48-72h): ¡Hay que atenderlo ya!
 * - ⚫ VENCIDO (+72h): Superó el límite de 72 horas
 */
export interface SemaforoPrioridad {
  nivel: 'EN_TIEMPO' | 'ATENCION' | 'URGENTE' | 'VENCIDO';
  label: string;
  horasTranscurridas: number;
  horasRestantes: number;
  porcentaje: number; // % de avance hacia el límite
  color: string;
  bgColor: string;
  borderColor: string;
  emoji: string;
  descripcion: string;
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
  expedientes: ExpedienteTlalcalli[] = [];
  pagesExpedientes: ExpedienteTlalcalli[][] = [];
  
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
  
  // Estadísticas de semáforo (nuevo sistema basado en tiempo transcurrido)
  estadisticasSemaforo = {
    en_tiempo: 0,  // 0-24h - Verde
    atencion: 0,   // 24-48h - Amarillo
    urgente: 0,    // 48-72h - Rojo
    vencido: 0     // +72h - Negro
  };
  
  responsable = '';
  
  // Opciones de estatus para el filtro
  opcionesEstatus = [
    { value: '', label: 'Todos' },
    { value: 'ASIGNADO', label: 'Asignado' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'EN_ATENCION', label: 'En Atención' },
    { value: 'RECHAZADO', label: 'Rechazado' },
    { value: 'ATENCION_PARCIAL', label: 'Atención Parcial' },
    { value: 'ATENCION_TOTAL', label: 'Atención Total' },
    { value: 'REVISION_LEGAL', label: 'Revisión Legal' }
  ];

  // ========= SWITCH PENDIENTES / ATENDIDOS =========
  vistaActual: 'pendientes' | 'atendidos' = 'pendientes';
  
  // Estatus que significan "pendiente de atención"
  estatusPendientes = ['ASIGNADO', 'PENDIENTE'];
  
  // Estatus que significan "ya atendido/en proceso"
  estatusAtendidos = ['EN_ATENCION', 'RECHAZADO', 'ATENCION_PARCIAL', 'ATENCION_TOTAL', 'REVISION_LEGAL'];

  // Opciones de prioridad (semáforo basado en tiempo transcurrido)
  opcionesPrioridad = [
    { value: '', label: 'Todas las prioridades' },
    { value: 'EN_TIEMPO', label: '🟢 En Tiempo (0-24h)' },
    { value: 'ATENCION', label: '🟡 Atención (24-48h)' },
    { value: 'URGENTE', label: '🔴 Urgente (48-72h)' },
    { value: 'VENCIDO', label: '⚫ Vencido (+72h)' }
  ];

  filtroPrioridad = '';
  
  // Labels de paginación
  labels = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente'
  };
  
  @ViewChild('sectionTable') sectionTable!: ElementRef;

  // Mapa para guardar las atenciones de cada expediente
  atencionesMap: Map<number, AtencionConEspecialistas> = new Map();

  constructor(
    private responsablesService: ResponsablesService,
    private atencionService: AtencionService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarExpedientes();
  }

  // Variable para guardar todos los expedientes sin filtrar
  private todosLosExpedientes: ExpedienteTlalcalli[] = [];

  /**
   * Cargar expedientes del responsable
   */
  cargarExpedientes(): void {
    this.cargando = true;
    this.mostrarTabla = false;

    this.responsablesService.obtenerMisExpedientes(this.filtros).subscribe({
      next: (response) => {
        let expedientes = response.data || [];
        
        // Guardar todos para los contadores
        this.todosLosExpedientes = expedientes;
        
        // Ordenar por prioridad (semáforo) - los más urgentes primero
        expedientes = this.ordenarPorPrioridad(expedientes);
        
        // Aplicar filtro de vista (pendientes/atendidos)
        expedientes = this.filtrarPorVista(expedientes);
        
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
        console.log('✅ Expedientes cargados:', this.expedientes.length, '(Vista:', this.vistaActual, ')');
      },
      error: (error: Error) => {
        console.error('❌ Error al cargar expedientes:', error);
        this.expedientes = [];
        this.todosLosExpedientes = [];
        this.mostrarTabla = false;
        this.cargando = false;
      }
    });
  }

  /**
   * Calcular el semáforo de prioridad basado en TIEMPO TRANSCURRIDO desde captura
   * 
   * ===== REGLAS DEL SEMÁFORO (72 HORAS LÍMITE) =====
   * 
   * 🟢 EN TIEMPO (0-24h transcurridas): Recién capturado, todo bien
   * 🟡 ATENCIÓN (24-48h transcurridas): Ya lleva tiempo, prestar atención
   * 🔴 URGENTE (48-72h transcurridas): ¡Hay que atenderlo ya!
   * ⚫ VENCIDO (+72h transcurridas): Superó el límite
   */
  calcularSemaforo(expediente: ExpedienteTlalcalli): SemaforoPrioridad {
    const ahora = new Date();
    const LIMITE_TOTAL = 72; // 72 horas es el límite máximo
    
    // Fecha base: cuando se capturó/finalizó el asunto
    let fechaBase: Date;
    if (expediente.fecha_creacion) {
      fechaBase = new Date(expediente.fecha_creacion);
    } else if (expediente.fecha_asignacion) {
      fechaBase = new Date(expediente.fecha_asignacion);
    } else {
      fechaBase = new Date();
    }
    
    // Calcular horas transcurridas desde la captura
    const horasTranscurridas = Math.max(0, Math.floor((ahora.getTime() - fechaBase.getTime()) / (1000 * 60 * 60)));
    const horasRestantes = LIMITE_TOTAL - horasTranscurridas;
    const porcentaje = Math.min(100, Math.round((horasTranscurridas / LIMITE_TOTAL) * 100));
    
    // ⚫ VENCIDO: Más de 72 horas transcurridas
    if (horasTranscurridas >= 72) {
      const horasExcedidas = horasTranscurridas - 72;
      return {
        nivel: 'VENCIDO',
        label: 'Vencido',
        horasTranscurridas,
        horasRestantes: 0,
        porcentaje: 100,
        color: 'text-gray-900',
        bgColor: 'bg-gray-900',
        borderColor: 'border-gray-900',
        emoji: '⚫',
        descripcion: horasExcedidas > 24 
          ? `+${Math.floor(horasExcedidas / 24)}d excedido` 
          : `+${horasExcedidas}h excedido`
      };
    }
    
    // 🔴 URGENTE: 48-72 horas transcurridas (¡ATENDER YA!)
    if (horasTranscurridas >= 48) {
      return {
        nivel: 'URGENTE',
        label: 'Urgente',
        horasTranscurridas,
        horasRestantes,
        porcentaje,
        color: 'text-red-600',
        bgColor: 'bg-red-600',
        borderColor: 'border-red-600',
        emoji: '🔴',
        descripcion: `${horasRestantes}h restantes`
      };
    }
    
    // 🟡 ATENCIÓN: 24-48 horas transcurridas
    if (horasTranscurridas >= 24) {
      return {
        nivel: 'ATENCION',
        label: 'Atención',
        horasTranscurridas,
        horasRestantes,
        porcentaje,
        color: 'text-amber-600',
        bgColor: 'bg-amber-500',
        borderColor: 'border-amber-500',
        emoji: '🟡',
        descripcion: `${horasRestantes}h restantes`
      };
    }
    
    // 🟢 EN TIEMPO: 0-24 horas transcurridas
    return {
      nivel: 'EN_TIEMPO',
      label: 'En Tiempo',
      horasTranscurridas,
      horasRestantes,
      porcentaje,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500',
      borderColor: 'border-emerald-500',
      emoji: '🟢',
      descripcion: `${horasRestantes}h restantes`
    };
  }

  /**
   * Ordenar expedientes por prioridad (más urgentes primero)
   * Los vencidos primero, luego urgentes, atención, y al final los que están en tiempo
   */
  ordenarPorPrioridad(expedientes: ExpedienteTlalcalli[]): ExpedienteTlalcalli[] {
    const ordenPrioridad: { [key: string]: number } = {
      'VENCIDO': 0,    // ⚫ Máxima prioridad (ya se pasó)
      'URGENTE': 1,    // 🔴 Muy urgente
      'ATENCION': 2,   // 🟡 Requiere atención
      'EN_TIEMPO': 3   // 🟢 Todo bien
    };
    
    return expedientes.sort((a, b) => {
      const semaforoA = this.calcularSemaforo(a);
      const semaforoB = this.calcularSemaforo(b);
      
      // Primero ordenar por nivel de prioridad
      const ordenA = ordenPrioridad[semaforoA.nivel] ?? 4;
      const ordenB = ordenPrioridad[semaforoB.nivel] ?? 4;
      
      if (ordenA !== ordenB) {
        return ordenA - ordenB;
      }
      
      // Si tienen el mismo nivel, ordenar por horas transcurridas (más tiempo = más urgente)
      return semaforoB.horasTranscurridas - semaforoA.horasTranscurridas;
    });
  }

  /**
   * Calcular estadísticas de semáforo (nuevo sistema de tiempo transcurrido)
   */
  calcularEstadisticasSemaforo(): void {
    this.estadisticasSemaforo = {
      en_tiempo: 0,  // 🟢 0-24h
      atencion: 0,   // 🟡 24-48h
      urgente: 0,    // 🔴 48-72h
      vencido: 0     // ⚫ +72h
    };
    
    this.expedientes.forEach(exp => {
      const semaforo = this.calcularSemaforo(exp);
      switch (semaforo.nivel) {
        case 'EN_TIEMPO':
          this.estadisticasSemaforo.en_tiempo++;
          break;
        case 'ATENCION':
          this.estadisticasSemaforo.atencion++;
          break;
        case 'URGENTE':
          this.estadisticasSemaforo.urgente++;
          break;
        case 'VENCIDO':
          this.estadisticasSemaforo.vencido++;
          break;
      }
    });
  }

  /**
   * Formatear tiempo transcurrido/restante a texto legible
   */
  formatearTiempo(semaforo: SemaforoPrioridad): string {
    if (semaforo.nivel === 'VENCIDO') {
      const excedido = semaforo.horasTranscurridas - 72;
      if (excedido >= 24) {
        return `+${Math.floor(excedido / 24)}d vencido`;
      }
      return `+${excedido}h vencido`;
    }
    
    const horas = semaforo.horasRestantes;
    if (horas < 24) {
      return `${horas}h restantes`;
    }
    const dias = Math.floor(horas / 24);
    const horasRest = horas % 24;
    if (horasRest === 0) {
      return `${dias}d restantes`;
    }
    return `${dias}d ${horasRest}h`;
  }

  /**
   * Formatear horas transcurridas
   */
  formatearHorasTranscurridas(horas: number): string {
    if (horas < 1) {
      return 'Recién capturado';
    }
    if (horas < 24) {
      return `${horas}h transcurridas`;
    }
    const dias = Math.floor(horas / 24);
    const horasRest = horas % 24;
    if (horasRest === 0) {
      return `${dias}d transcurridos`;
    }
    return `${dias}d ${horasRest}h`;
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
   * Cambiar entre vista de pendientes y atendidos
   */
  cambiarVista(vista: 'pendientes' | 'atendidos'): void {
    this.vistaActual = vista;
    this.pageSelected = 1;
    this.cargarExpedientes();
    
    // Si cambia a "atendidos", cargar las atenciones de esos expedientes
    if (vista === 'atendidos') {
      setTimeout(() => this.cargarAtencionesExpedientes(), 500);
    }
  }

  /**
   * Filtrar expedientes según la vista actual (pendientes/atendidos)
   */
  filtrarPorVista(expedientes: ExpedienteTlalcalli[]): ExpedienteTlalcalli[] {
    if (this.vistaActual === 'pendientes') {
      return expedientes.filter(exp => 
        !exp.estatus || this.estatusPendientes.includes(exp.estatus.toUpperCase())
      );
    } else {
      return expedientes.filter(exp => 
        exp.estatus && this.estatusAtendidos.includes(exp.estatus.toUpperCase())
      );
    }
  }

  /**
   * Contar expedientes por vista (usa TODOS los expedientes, no los filtrados)
   */
  get contadorPendientes(): number {
    return this.todosLosExpedientes.filter(exp => 
      !exp.estatus || this.estatusPendientes.includes(exp.estatus?.toUpperCase() || '')
    ).length;
  }

  get contadorAtendidos(): number {
    return this.todosLosExpedientes.filter(exp => 
      exp.estatus && this.estatusAtendidos.includes(exp.estatus.toUpperCase())
    ).length;
  }

  /**
   * Obtener el label del tipo de acción para mostrar en la tabla
   */
  getLabelTipoAccion(tipoAccion: string): string {
    const labels: { [key: string]: string } = {
      'RECHAZADO': 'Rechazado',
      'PENDIENTE_INFO': 'Pendiente Info',
      'ATENCION_INMEDIATA': 'Atención Inmediata',
      'ADQUISICION_INFO': 'Adquisición Info',
      'INVESTIGACION_FORENSE': 'Investigación Forense',
      'ELABORACION_DICTAMENES': 'Elaboración Dictámenes',
      'RECUPERACION_INFO': 'Recuperación Info',
      'DESTRUCCION_DISPOSITIVOS': 'Destrucción Dispositivos'
    };
    return labels[tipoAccion] || tipoAccion;
  }

  /**
   * Obtener el color del tipo de acción
   */
  getColorTipoAccion(tipoAccion: string): string {
    const colores: { [key: string]: string } = {
      'RECHAZADO': 'rechazado',
      'PENDIENTE_INFO': 'pendiente',
      'ATENCION_INMEDIATA': 'inmediata',
      'ADQUISICION_INFO': 'adquisicion',
      'INVESTIGACION_FORENSE': 'forense',
      'ELABORACION_DICTAMENES': 'dictamen',
      'RECUPERACION_INFO': 'recuperacion',
      'DESTRUCCION_DISPOSITIVOS': 'destruccion'
    };
    return colores[tipoAccion] || 'default';
  }

  /**
   * Cargar las atenciones de los expedientes en vista "atendidos"
   */
  cargarAtencionesExpedientes(): void {
    const expedientesAtendidos = this.expedientes.filter(exp => 
      exp.estatus && this.estatusAtendidos.includes(exp.estatus.toUpperCase())
    );
    
    expedientesAtendidos.forEach(exp => {
      if (exp.id_expediente && !this.atencionesMap.has(exp.id_expediente)) {
        this.atencionService.obtenerAtencionesExpediente(exp.id_expediente).subscribe({
          next: (atenciones) => {
            if (atenciones && atenciones.length > 0) {
              // Guardar la última atención (la más reciente)
              this.atencionesMap.set(exp.id_expediente!, atenciones[0]);
            }
          },
          error: (err) => console.error('Error cargando atención:', err)
        });
      }
    });
  }

  /**
   * Obtener la atención de un expediente
   */
  getAtencionExpediente(idExpediente: number | undefined): AtencionConEspecialistas | undefined {
    if (!idExpediente) return undefined;
    return this.atencionesMap.get(idExpediente);
  }

  /**
   * Ver detalle de expediente
   */
  verDetalleExpediente(expediente: ExpedienteTlalcalli): void {
    const dialogRef = this.dialog.open(ExpedienteDetalleModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'expediente-modal-panel',
      data: { expediente }
    });

    dialogRef.afterClosed().subscribe(() => {
      // Recargar expedientes después de cerrar el modal (por si se actualizó algo)
      this.cargarExpedientes();
    });
  }

  /**
   * Abrir modal de atención para procesar el expediente
   */
  abrirModalAtencion(expediente: ExpedienteTlalcalli): void {
    console.log('📋 [ResponsablesTable] Abriendo modal de atención para:', expediente.expediente);
    
    const dialogRef = this.dialog.open(AtencionModalComponent, {
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'atencion-modal-panel',
      data: { expediente },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('📋 [ResponsablesTable] Modal de atención cerrado:', result);
      if (result?.success) {
        // Recargar expedientes si se guardó una atención
        this.cargarExpedientes();
      }
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
