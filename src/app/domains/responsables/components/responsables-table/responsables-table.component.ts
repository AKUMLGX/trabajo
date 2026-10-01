import { Component, OnInit, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResponsablesService, FiltrosResponsable } from '../../services/responsables.service';
import {
  AlertaCompromiso,
  ResumenSeguimiento,
  SeguimientoAsignacionService,
} from '../../services/seguimiento-asignacion.service';
import { ExpedienteTlalcalli } from '../../../capture/interfaces/expediente-tlalcalli.interface';
import { ExpedienteDetalleModalComponent } from '../../../tracking/components/expediente-detalle-modal/expediente-detalle-modal.component';
import { SeguimientoAccionesModalComponent } from '../seguimiento-acciones-modal/seguimiento-acciones-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../../environments/environment';
import { ExpedienteTlalcalliService } from '../../../capture/services/expediente-tlalcalli.service';
import { DateUtils } from '../../../capture/utils/date-utils';
import { CatalogoReworkCacheService } from '../../../capture/services/catalogo-rework-cache.service';

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
    imports: [
        CommonModule,
        FormsModule,
        MatIcon,
        MatSlideToggleModule,
        NgxPaginationModule
    ],
    templateUrl: './responsables-table.component.html',
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

  /** Promedio de horas transcurridas de los expedientes por atender. */
  promedioHorasPendientes = 0;
  
  responsable = '';
  
  // Opciones de estatus para el filtro
  opcionesEstatus: { value: string; label: string }[] = [{ value: '', label: 'Todos' }];

  /**
   * Listado global rework (sin filtro `responsable` en data_busqueda).
   * Por defecto true mientras negocio prueba; solo OAuth si `devCentroControlSoloMiBandeja` o el usuario desactiva el toggle.
   */
  incluirTodosCapturas = ResponsablesTableComponent.resolverListadoGlobalInicial();

  /**
   * Mientras no haya roles: env.js con devVistaEquipoCentroControl envía vista_equipo (solo equipo de captura).
   * Se ignora si incluirTodosCapturas está activo.
   */
  vistaEquipoCentroControl = environment.devVistaEquipoCentroControl;

  // ========= SWITCH PENDIENTES / ATENDIDOS =========
  vistaActual: 'pendientes' | 'atendidos' = 'pendientes';

  // Estatus que significan "ya atendidos / en proceso de cierre" (lo demás aparece en "Por atender")
  estatusAtendidos = ['ATENDIDO', 'CONOCIMIENTO', 'CANCELADO'];

  /** Subcadenas en `responsable` para modo "vista equipo" (filtro cliente sobre listado global). */
  private readonly RESPONSABLES_EQUIPO_SUBSTR = ['irma', 'karen', 'hector', 'carlos'];

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

  resumenSeguimiento = new Map<number, ResumenSeguimiento>();
  alertasCompromiso: AlertaCompromiso[] = [];
  mostrarDetalleAlertas = false;

  constructor(
    private responsablesService: ResponsablesService,
    private expedienteService: ExpedienteTlalcalliService,
    private seguimientoService: SeguimientoAsignacionService,
    private dialog: MatDialog,
    private catalogos: CatalogoReworkCacheService
  ) {}

  /** true = todos los expedientes rework; false = solo el responsable mapeado del JWT. */
  private static resolverListadoGlobalInicial(): boolean {
    const winEnv = (window as { env?: Record<string, unknown> }).env;
    const soloMi = winEnv?.['devCentroControlSoloMiBandeja'];
    if (soloMi === true || soloMi === 'true' || soloMi === 1 || soloMi === '1') {
      return false;
    }
    const todos = winEnv?.['devIncluirTodasCapturasResponsables'];
    if (todos === true || todos === 'true' || todos === 1 || todos === '1') {
      return true;
    }
    if (todos === false || todos === 'false' || todos === 0 || todos === '0') {
      // Pilot: en Balam env.js traía false; ignorar hasta tener roles por bandeja.
      return true;
    }
    return true;
  }

  ngOnInit(): void {
    this.catalogos.getCat(3).subscribe((items) => {
      const opciones = items.map((i) => {
        const valor = i.descripcion.trim().toUpperCase() === 'PEDIENTE' ? 'PENDIENTE' : i.descripcion.trim().toUpperCase();
        return { value: valor, label: valor };
      });
      this.opcionesEstatus = [{ value: '', label: 'Todos' }, ...opciones];
    });
    this.cargarExpedientes();
  }

  private cargarIndicadoresSeguimiento(): void {
    this.seguimientoService.obtenerResumen().subscribe((filas) => {
      this.resumenSeguimiento = new Map(filas.map((f) => [f.id_expediente, f]));
    });
    this.seguimientoService.obtenerAlertas().subscribe((alertas) => {
      this.alertasCompromiso = alertas;
    });
  }

  getResumenSeguimiento(idExpediente: number | undefined): ResumenSeguimiento | undefined {
    return idExpediente ? this.resumenSeguimiento.get(idExpediente) : undefined;
  }

  // Variable para guardar todos los expedientes sin filtrar
  private todosLosExpedientes: ExpedienteTlalcalli[] = [];

  /**
   * Cargar expedientes del responsable (rework, mismo origen que bandeja de seguimiento).
   */
  cargarExpedientes(): void {
    this.cargando = true;
    this.mostrarTabla = false;
    this.cargarIndicadoresSeguimiento();

    const filtrosConsulta = this.construirFiltrosConsultaCentroControl();

    const procesarLista = (lista: ExpedienteTlalcalli[], responsableLabel = ''): void => {
      let raw = lista || [];
      if (this.vistaEquipoCentroControl && !this.incluirTodosCapturas) {
        raw = raw.filter((exp) => this.esResponsableEquipoCaptura(exp));
      }
      raw = this.aplicarFiltrosConsultaLocales(raw);
      const stats = this.estadisticasDesdeLista(raw);
      const label =
        responsableLabel ||
        (this.incluirTodosCapturas ? 'Todos los responsables' : 'Equipo de captura');
      this.finalizarCargaLista(raw, stats, label);
      console.log('✅ Expedientes cargados (rework):', this.expedientes.length, '(Vista:', this.vistaActual, ')');
    };

    const onError = (error: Error, contexto: string): void => {
      console.error(`❌ Error al cargar expedientes (${contexto}):`, error);
      this.expedientes = [];
      this.todosLosExpedientes = [];
      this.mostrarTabla = false;
      this.cargando = false;
    };

    if (this.usarListadoGlobalExpedientes()) {
      this.expedienteService.consultarExpedientes(filtrosConsulta).subscribe({
        next: (lista) => procesarLista(lista),
        error: (error: Error) => onError(error, 'listado global rework'),
      });
      return;
    }

    // Vista por responsable OAuth: nombre desde mis-expedientes, datos desde rework.
    this.responsablesService.obtenerMisExpedientes({}).subscribe({
      next: (response) => {
        const responsable = response.responsable || '';
        const filtrosConResponsable = responsable
          ? { ...filtrosConsulta, responsable }
          : filtrosConsulta;
        this.expedienteService.consultarExpedientes(filtrosConResponsable).subscribe({
          next: (lista) => procesarLista(lista, responsable),
          error: (error: Error) => onError(error, 'rework por responsable'),
        });
      },
      error: (error: Error) => onError(error, 'mapeo responsable'),
    });
  }

  /** Filtros alineados con POST expedientes_rework/data_busqueda (misma API que seguimiento). */
  private construirFiltrosConsultaCentroControl(): Record<string, unknown> {
    const f = this.filtros;
    const q = (f.oficio || f.expediente || '').trim();
    return {
      oficio: q,
      expediente: q,
      remitente_area: f.remitente_area || '',
      fecha_creacion_desde: f.fecha_desde || '',
      fecha_creacion_hasta: f.fecha_hasta || '',
    };
  }

  /** Vista global (todas las capturas o equipo) vs solo el responsable del JWT. */
  private usarListadoGlobalExpedientes(): boolean {
    return this.incluirTodosCapturas || this.vistaEquipoCentroControl;
  }

  private esResponsableEquipoCaptura(exp: ExpedienteTlalcalli): boolean {
    const r = (exp.responsable || '').trim().toLowerCase();
    if (!r) return false;
    return this.RESPONSABLES_EQUIPO_SUBSTR.some((n) => r.includes(n));
  }

  /** Filtros del formulario aplicados sobre un arreglo local (same keys que MisExpedientes). */
  private aplicarFiltrosConsultaLocales(data: ExpedienteTlalcalli[]): ExpedienteTlalcalli[] {
    let rows = [...data];
    const f = this.filtros;

    if (f.estatus) {
      const est = f.estatus.toUpperCase();
      rows = rows.filter((e) => (e.estatus || '').toUpperCase() === est);
    }

    const q = (f.oficio || f.expediente || '').trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (e) =>
          (e.oficio || '').toLowerCase().includes(q) ||
          (e.expediente || '').toLowerCase().includes(q) ||
          (e.referencia_asunto || '').toLowerCase().includes(q) ||
          (e.remitente_area || '').toLowerCase().includes(q)
      );
    }

    if (f.remitente_area && !q) {
      const rm = f.remitente_area.trim().toLowerCase();
      rows = rows.filter((e) => (e.remitente_area || '').toLowerCase().includes(rm));
    }

    if (f.fecha_desde || f.fecha_hasta) {
      rows = rows.filter((e) => {
        const base = this.fechaFiltroExpediente(e);
        if (!base) return false;
        if (f.fecha_desde) {
          const d0 = new Date(f.fecha_desde + 'T00:00:00');
          if (base < d0) return false;
        }
        if (f.fecha_hasta) {
          const d1 = new Date(f.fecha_hasta + 'T23:59:59');
          if (base > d1) return false;
        }
        return true;
      });
    }

    return rows;
  }

  private fechaFiltroExpediente(e: ExpedienteTlalcalli): Date | null {
    return this.fechaBaseSemaforo(e);
  }

  /** Rework devuelve fechas como DD/MM/YYYY; `new Date()` directo produce NaN. */
  private fechaBaseSemaforo(e: ExpedienteTlalcalli): Date | null {
    const candidatas = [e.fecha_creacion, e.fecha_recibido, e.fecha_asignacion];
    for (const valor of candidatas) {
      const fecha = DateUtils.parseFechaLocal(valor as string | Date | null | undefined);
      if (fecha) {
        return fecha;
      }
    }
    return null;
  }

  private estadisticasDesdeLista(data: ExpedienteTlalcalli[]): {
    total: number;
    con_retraso: number;
    urgentes: number;
    por_estatus: { [key: string]: number };
  } {
    const por_estatus: { [key: string]: number } = {};
    for (const e of data) {
      const k = e.estatus || 'SIN_ESTATUS';
      por_estatus[k] = (por_estatus[k] || 0) + 1;
    }
    return {
      total: data.length,
      con_retraso: 0,
      urgentes: 0,
      por_estatus
    };
  }

  private finalizarCargaLista(
    raw: ExpedienteTlalcalli[],
    estadisticas: { total: number; con_retraso: number; urgentes: number; por_estatus: { [key: string]: number } },
    responsableLabel: string
  ): void {
    this.todosLosExpedientes = raw;
    let expedientes = this.ordenarPorPrioridad([...raw]);
    expedientes = this.filtrarPorVista(expedientes);
    if (this.filtroPrioridad) {
      expedientes = expedientes.filter((exp) => this.calcularSemaforo(exp).nivel === this.filtroPrioridad);
    }
    this.expedientes = expedientes;
    this.estadisticas = estadisticas;
    this.responsable = responsableLabel;
    this.calcularEstadisticasSemaforo();
    this.paginarExpedientes();
    this.mostrarTabla = true;
    this.cargando = false;
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
    
    const fechaBase = this.fechaBaseSemaforo(expediente) ?? ahora;

    const horasCalculadas = Math.floor((ahora.getTime() - fechaBase.getTime()) / (1000 * 60 * 60));
    const horasTranscurridas = Number.isFinite(horasCalculadas) ? Math.max(0, horasCalculadas) : 0;
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

    const fuente = this.todosLosExpedientes.length ? this.todosLosExpedientes : this.expedientes;

    const pendientes = fuente.filter((exp) => {
      const s = (exp.estatus || '').toUpperCase();
      return !s || !this.estatusAtendidos.includes(s);
    });
    const sumaHoras = pendientes.reduce((acc, exp) => acc + this.calcularSemaforo(exp).horasTranscurridas, 0);
    this.promedioHorasPendientes = pendientes.length ? Math.round(sumaHoras / pendientes.length) : 0;

    fuente.forEach((exp) => {
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

  formatearPromedioHoras(horas: number): string {
    if (horas < 24) {
      return `${horas} h`;
    }
    const dias = Math.floor(horas / 24);
    const resto = horas % 24;
    return resto ? `${dias}d ${resto}h` : `${dias}d`;
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
  }

  /** Activa/desactiva carga de todas las capturas desde el backend (sin filtro por responsable). */
  onToggleIncluirTodos(activo: boolean): void {
    this.incluirTodosCapturas = activo;
    this.pageSelected = 1;
    this.cargarExpedientes();
  }

  /**
   * Filtrar expedientes según la vista actual (pendientes/atendidos)
   */
  filtrarPorVista(expedientes: ExpedienteTlalcalli[]): ExpedienteTlalcalli[] {
    if (this.vistaActual === 'pendientes') {
      return expedientes.filter((exp) => {
        const s = (exp.estatus || '').toUpperCase();
        return !s || !this.estatusAtendidos.includes(s);
      });
    }
    return expedientes.filter(
      (exp) => exp.estatus && this.estatusAtendidos.includes(exp.estatus.toUpperCase())
    );
  }

  /**
   * Contar expedientes por vista (usa TODOS los expedientes, no los filtrados)
   */
  get contadorPendientes(): number {
    return this.todosLosExpedientes.filter((exp) => {
      const s = (exp.estatus || '').toUpperCase();
      return !s || !this.estatusAtendidos.includes(s);
    }).length;
  }

  get contadorAtendidos(): number {
    return this.todosLosExpedientes.filter(exp => 
      exp.estatus && this.estatusAtendidos.includes(exp.estatus.toUpperCase())
    ).length;
  }

  /**
   * Ver detalle de expediente
   */
  verDetalleExpediente(expediente: ExpedienteTlalcalli): void {
    const dialogRef = this.dialog.open(ExpedienteDetalleModalComponent, {
      width: '96vw',
      maxWidth: '1400px',
      height: '92vh',
      maxHeight: '92vh',
      panelClass: 'expediente-detalle-dialog',
      data: { expediente }
    });

    dialogRef.afterClosed().subscribe(() => {
      // Recargar expedientes después de cerrar el modal (por si se actualizó algo)
      this.cargarExpedientes();
    });
  }

  abrirModalSeguimiento(expediente: ExpedienteTlalcalli): void {
    const dialogRef = this.dialog.open(SeguimientoAccionesModalComponent, {
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'atencion-modal-panel',
      data: { expediente },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.estatusActualizado) {
        this.cargarExpedientes();
      } else if (result?.success) {
        this.cargarIndicadoresSeguimiento();
      }
    });
  }

  abrirSeguimientoPorId(idExpediente: number): void {
    const expediente = this.todosLosExpedientes.find((e) => e.id_expediente === idExpediente);
    if (expediente) {
      this.abrirModalSeguimiento(expediente);
    }
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
