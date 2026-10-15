import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { FiltrosResponsable } from '../../services/responsables.service';
import { AlertaCompromiso, ResumenSeguimiento } from '../../services/seguimiento-asignacion.service';
import { BandejaSeguimientoFacade, ContextoBandeja, OpcionFiltro } from '../../services/bandeja-seguimiento.facade';
import { ExpedienteTlalcalli } from '../../../capture/interfaces/expediente-tlalcalli.interface';
import { ExpedienteDetalleModalComponent } from '../../../tracking/components/expediente-detalle-modal/expediente-detalle-modal.component';
import { SeguimientoAccionesModalComponent } from '../seguimiento-acciones-modal/seguimiento-acciones-modal.component';
import {
  NotificarAsignacionModalComponent,
  NotificarAsignacionModalData,
  NotificarAsignacionModalResultado,
} from '../notificar-asignacion-modal/notificar-asignacion-modal.component';
import { FiltrosSeguimientoComponent } from '../filtros-seguimiento/filtros-seguimiento.component';
import { ResumenPrioridadSeguimientoComponent } from '../resumen-prioridad-seguimiento/resumen-prioridad-seguimiento.component';
import { AlertasCompromisoComponent } from '../alertas-compromiso/alertas-compromiso.component';
import { EtiquetaEstatusPipe } from '../../../shared/pipes/etiqueta-estatus.pipe';
import { TablaPaginadorComponent } from '../../../shared/components/tabla-paginador/tabla-paginador.component';
import { paginar } from '../../../shared/utils/paginacion.utils';
import { environment } from '../../../../../environments/environment';
import { ClasificacionPrioridadAsunto, clasificarPrioridadAsunto } from '../../../capture/utils/prioridad-asunto.utils';
import {
  ConteoSemaforo,
  ETIQUETAS_NIVEL_PRIORIDAD,
  VistaBandeja,
  aplicarFiltrosLocales,
  construirFiltrosConsulta,
  contarSemaforo,
  esAtendido,
  esResponsableEquipoCaptura,
  filtrarPorVista,
  ordenarPorPrioridad,
} from '../../utils/bandeja-seguimiento.utils';
import { LineaAsignacionResumen, lineasAsignacionEnResumen } from '../../utils/resumen-asignaciones.utils';

export type SemaforoPrioridad = ClasificacionPrioridadAsunto;

const CONTEXTO_INICIAL: ContextoBandeja = { puedeEditarSeguimiento: false, soloAsignados: false, especialista: null };

@Component({
  selector: 'app-responsables-table',
  imports: [
    CommonModule,
    EtiquetaEstatusPipe,
    FiltrosSeguimientoComponent,
    ResumenPrioridadSeguimientoComponent,
    AlertasCompromisoComponent,
    TablaPaginadorComponent,
  ],
  templateUrl: './responsables-table.component.html',
})
export class ResponsablesTableComponent implements OnInit {
  private readonly bandeja = inject(BandejaSeguimientoFacade);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  /** Todos los asuntos cargados (sin vista ni filtro de prioridad); base de contadores. */
  private todosLosExpedientes: ExpedienteTlalcalli[] = [];
  expedientes: ExpedienteTlalcalli[] = [];
  pagina = 1;
  tamanoPagina = 10;
  readonly opcionesTamanoPagina = [10, 20, 50];

  filtros: FiltrosResponsable = {};
  filtroPrioridad = '';
  vistaActual: VistaBandeja = 'pendientes';
  opcionesEstatus: OpcionFiltro[] = [{ value: '', label: 'Todos' }];

  cargando = false;
  mostrarTabla = false;
  responsable = '';
  totalExpedientes = 0;
  conteoSemaforo: ConteoSemaforo = { en_tiempo: 0, urgente: 0, extra_urgente: 0, vencido: 0 };

  resumenSeguimiento = new Map<number, ResumenSeguimiento>();
  alertasCompromiso: AlertaCompromiso[] = [];

  contexto: ContextoBandeja = CONTEXTO_INICIAL;

  /** true = todos los expedientes rework; false = solo el responsable mapeado del JWT. */
  incluirTodosCapturas = resolverListadoGlobalInicial();

  /** Con env `devVistaEquipoCentroControl`: solo el equipo de captura. Se ignora si `incluirTodosCapturas`. */
  private readonly vistaEquipoCentroControl = environment.devVistaEquipoCentroControl;

  get puedeEditarSeguimiento(): boolean {
    return this.contexto.puedeEditarSeguimiento;
  }

  get soloAsignados(): boolean {
    return this.contexto.soloAsignados;
  }

  get sinAsuntosAsignados(): boolean {
    return this.soloAsignados && this.todosLosExpedientes.length === 0;
  }

  ngOnInit(): void {
    this.bandeja
      .obtenerOpcionesEstatus()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((opciones) => (this.opcionesEstatus = opciones));

    this.bandeja
      .obtenerContexto()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((contexto) => {
        this.contexto = contexto;
        if (contexto.soloAsignados) {
          this.incluirTodosCapturas = true;
        }
        this.cargarExpedientes();
      });
  }

  /** El especialista solo ve las alertas de sus propios asuntos. */
  get alertasVisibles(): AlertaCompromiso[] {
    if (!this.soloAsignados) return this.alertasCompromiso;
    const propios = new Set(this.todosLosExpedientes.map((e) => e.id_expediente));
    return this.alertasCompromiso.filter((a) => propios.has(a.id_expediente));
  }

  get expedientesPagina(): ExpedienteTlalcalli[] {
    return paginar(this.expedientes, this.pagina, this.tamanoPagina);
  }

  get contadorPendientes(): number {
    return this.todosLosExpedientes.filter((e) => !esAtendido(e)).length;
  }

  get contadorAtendidos(): number {
    return this.todosLosExpedientes.filter(esAtendido).length;
  }

  getResumenSeguimiento(idExpediente: number | undefined): ResumenSeguimiento | undefined {
    return idExpediente ? this.resumenSeguimiento.get(idExpediente) : undefined;
  }

  lineasAsignacionResumen(resumen: ResumenSeguimiento): LineaAsignacionResumen[] {
    return lineasAsignacionEnResumen(resumen, this.soloAsignados);
  }

  cargarExpedientes(): void {
    this.cargando = true;
    this.mostrarTabla = false;
    this.cargarIndicadoresSeguimiento();

    this.bandeja
      .cargarExpedientes({
        filtrosConsulta: construirFiltrosConsulta(this.filtros),
        contexto: this.contexto,
        listadoGlobal: this.incluirTodosCapturas || this.vistaEquipoCentroControl,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ expedientes, responsable }) => this.mostrarLista(expedientes, responsable),
        error: (error: Error) => {
          console.error('Error al cargar expedientes de seguimiento:', error);
          this.expedientes = [];
          this.todosLosExpedientes = [];
          this.mostrarTabla = false;
          this.cargando = false;
        },
      });
  }

  private cargarIndicadoresSeguimiento(): void {
    this.bandeja
      .obtenerIndicadores()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ resumen, alertas }) => {
        this.resumenSeguimiento = resumen;
        this.alertasCompromiso = alertas;
      });
  }

  private mostrarLista(lista: ExpedienteTlalcalli[], responsable: string): void {
    let filas = lista;
    if (this.vistaEquipoCentroControl && !this.incluirTodosCapturas) {
      filas = filas.filter(esResponsableEquipoCaptura);
    }
    filas = aplicarFiltrosLocales(filas, this.filtros);

    this.todosLosExpedientes = filas;
    let visibles = filtrarPorVista(ordenarPorPrioridad(filas), this.vistaActual);
    if (this.filtroPrioridad) {
      visibles = visibles.filter((e) => clasificarPrioridadAsunto(e).nivel === this.filtroPrioridad);
    }

    this.expedientes = visibles;
    this.totalExpedientes = filas.length;
    this.responsable = responsable || (this.incluirTodosCapturas ? 'Todos los responsables' : 'Equipo de captura');
    this.conteoSemaforo = contarSemaforo(filas);
    this.mostrarTabla = true;
    this.cargando = false;
  }

  calcularSemaforo(expediente: ExpedienteTlalcalli): SemaforoPrioridad {
    return clasificarPrioridadAsunto(expediente);
  }

  etiquetaPrioridadFiltro(nivel: string): string {
    return ETIQUETAS_NIVEL_PRIORIDAD[nivel] ?? nivel;
  }

  aplicarFiltros(): void {
    this.pagina = 1;
    this.cargarExpedientes();
  }

  filtrarPorPrioridad(nivel: string): void {
    this.filtroPrioridad = nivel;
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtros = {};
    this.filtroPrioridad = '';
    this.aplicarFiltros();
  }

  cambiarVista(vista: VistaBandeja): void {
    this.vistaActual = vista;
    this.aplicarFiltros();
  }

  cambiarIncluirTodos(activo: boolean): void {
    this.incluirTodosCapturas = activo;
    this.aplicarFiltros();
  }

  verDetalleExpediente(expediente: ExpedienteTlalcalli): void {
    this.dialog
      .open(ExpedienteDetalleModalComponent, {
        width: '96vw',
        maxWidth: '1400px',
        height: '92vh',
        maxHeight: '92vh',
        panelClass: 'expediente-detalle-dialog',
        data: { expediente, soloLectura: !this.puedeEditarSeguimiento },
      })
      .afterClosed()
      .subscribe(() => this.cargarExpedientes());
  }

  abrirModalSeguimiento(expediente: ExpedienteTlalcalli): void {
    this.dialog
      .open(SeguimientoAccionesModalComponent, {
        maxWidth: '95vw',
        maxHeight: '95vh',
        panelClass: 'atencion-modal-panel',
        data: { expediente, soloLectura: !this.puedeEditarSeguimiento },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.estatusActualizado) {
          this.cargarExpedientes();
        } else if (result?.success) {
          this.cargarIndicadoresSeguimiento();
        }
      });
  }

  /** El back permite notificar una sola vez por expediente. */
  yaNotificado(expediente: ExpedienteTlalcalli): boolean {
    return !!this.getResumenSeguimiento(expediente.id_expediente)?.fecha_notificacion_asignacion;
  }

  tituloNotificarAsignacion(expediente: ExpedienteTlalcalli): string {
    return this.yaNotificado(expediente)
      ? 'El correo de asignación ya se envió; el asunto está en Atención y cierre'
      : 'Enviar correo de asignación';
  }

  abrirModalNotificarAsignacion(expediente: ExpedienteTlalcalli): void {
    this.dialog
      .open<NotificarAsignacionModalComponent, NotificarAsignacionModalData, NotificarAsignacionModalResultado>(
        NotificarAsignacionModalComponent,
        { maxWidth: '95vw', maxHeight: '95vh', panelClass: 'atencion-modal-panel', data: { expediente } }
      )
      .afterClosed()
      .subscribe((resultado) => {
        if (resultado?.enviado) {
          this.cargarExpedientes();
        }
      });
  }

  abrirSeguimientoPorId(idExpediente: number): void {
    const expediente = this.todosLosExpedientes.find((e) => e.id_expediente === idExpediente);
    if (expediente) {
      this.abrirModalSeguimiento(expediente);
    }
  }
}

/** Por defecto listado global; `devCentroControlSoloMiBandeja` en env.js lo limita al responsable del JWT. */
function resolverListadoGlobalInicial(): boolean {
  const soloMi = (window as { env?: Record<string, unknown> }).env?.['devCentroControlSoloMiBandeja'];
  return !(soloMi === true || soloMi === 'true' || soloMi === 1 || soloMi === '1');
}
