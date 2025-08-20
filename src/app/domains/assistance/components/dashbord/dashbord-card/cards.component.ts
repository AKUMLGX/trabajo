import { tableAsuntosPorDictaminar } from './../../../../interfaces/porAsignarRequest.interface';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { environment } from './../../../../../../environments/environment';
import { CardsgraphicComponent } from '../dashbord-graphic/Pie-chart/cardsgraphic.component';
import { GraphicAdministracionComponent } from '../dashbord-graphic/vertical-graph/graphic-administracion.component';
import { TrafficLightsAtencionComponent } from '../TrafficLights/traffic-lights-atencion/traffic-lights-atencion.component';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FormsModule } from '@angular/forms';
import { SafePipe } from '../../../../../shared/pipes/safe.pipe';
import { CardsInfoBandejadeAtencionService } from '../../../../services/cards-info-bandejade-atencion.service';
import { AdministracionResponse, Cards, CardsResponse, } from '../../../../interfaces/datosCards.interface';
import { porAsignarRequest } from '../../../../interfaces/porAsignarRequest.interface';
import { porAsignarResponse } from '../../../../interfaces/porAsignarResponse.interface';
import { usuariosPorAdministracion } from '../../../../interfaces/usuarios-Por-administracion.interface';
// Eliminado por solicitud: módulo de rechazados
// import { RechazadosTableComponent, AsuntoRechazado } from '../rechazados-table/rechazados-table.component';
// import { RechazadosGestionComponent, Dictaminador } from '../rechazados-gestion/rechazados-gestion.component';
import { RevisionModalComponent } from '../revision-modal/revision-modal.component';
import { ArchivosAtencionService, ArchivoAdjunto } from '../../../../services/archivos-atencion.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { AtencionModalComponent } from '../atencion-modal/atencion-modal.component';



@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [
    MatIconModule,
    MatCardModule,
    RouterModule,
    // RouterOutlet,
    CommonModule,
    // CardsgraphicComponent,
    // GraphicAdministracionComponent,
    // TrafficLightsAtencionComponent,
    NgxExtendedPdfViewerModule,
    FormsModule,
    SafePipe,
    // RechazadosTableComponent,
    // RechazadosGestionComponent,
    RevisionModalComponent,
    NgxPaginationModule,
    AtencionModalComponent,

  ],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css'],
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes zoomIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }

    .animate-zoomIn {
      animation: zoomIn 0.3s ease-out;
    }

    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }

    .transform {
      transform-origin: center;
    }

    .hover\\:-translate-y-1:hover {
      transform: translateY(-0.25rem);
    }
  `]
})
export class CardsComponent implements OnInit {
  mostrarSemaforo = true

  environment = environment;
  @Output() mostrarSemaforoContenido = new EventEmitter<void>()

  mostrarSemaforoN(): void {
    this.mostrarSemaforoContenido.emit()
  }

  documento: string = 'REQUERIMIENTO'
  // estado_atencion ya no se usa
  asignadosTable: boolean = true
  porAsignarTotal: number = 0
  asignarData = true

  tablePorDictaminar: tableAsuntosPorDictaminar[] = []

  // 🎨 NUEVO SISTEMA DE FILTRADO TIPO CARRUSEL - ULTRA RÁPIDO
  dictaminadoresUnicos: string[] = [] // Lista de dictaminadores únicos
  dictaminadorActivoAtencion: string = '' // Dictaminador activo en "En Atención"
  dictaminadorActivoAprobacion: string = '' // Dictaminador activo en "Por Aprobar"

  // Datos filtrados por vista
  asuntosEnAtencionFiltrados: tableAsuntosPorDictaminar[] = []
  asuntosPorAprobarFiltrados: tableAsuntosPorDictaminar[] = []

  porAsignarData: porAsignarRequest = {
    documento: this.documento
    // estado_atencion ya no se envía
  }

  porAsignarDataTable: porAsignarRequest = {
    documento: this.documento
    // estado_atencion ya no se envía
  }

  porAsignarDataResponse: porAsignarResponse = {
    total: this.porAsignarTotal,
    dicataminadorData: false
  }

  usuariosAsignar: usuariosPorAdministracion[] = []

  asuntosUrgentes: number = 0;

  //#region paginador
  pages: tableAsuntosPorDictaminar[][] = [];

  itemsPerPage: number = 5;
  pageSelected: number = 1;
  labelsPaginator = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
  };
  //#endregion


  constructor(
    private router: Router,
    private cards: CardsInfoBandejadeAtencionService,
    private archivosService: ArchivosAtencionService
  ) { }

  // Propiedades para manejar la notificación
  mostrarNotificacion: boolean = false;
  mensajeNotificacion: string = '';

  // Datos de ejemplo para la tabla
  asuntos: any[] = [
    { folio: 'F001', autoridad: 'Servicio de Administración Tributaria', fecha: '01/04/2024', fechaCaptura: '31/03/2024', dictaminador: 'María Hernández' },
    { folio: 'F002', autoridad: 'Secretaría de Finanzas', fecha: '01/04/2024', fechaCaptura: '31/03/2024', dictaminador: 'Juan Rodríguez' },
    { folio: 'F003', autoridad: 'Procuraduría Fiscal', fecha: '02/04/2024', fechaCaptura: '01/04/2024', dictaminador: 'Carlos Sánchez' },
    { folio: 'F004', autoridad: 'Servicio de Administración Tributaria', fecha: '02/04/2024', fechaCaptura: '01/04/2024', dictaminador: 'Ana González' },
    { folio: 'F005', autoridad: 'Unidad de Inteligencia Financiera', fecha: '03/04/2024', fechaCaptura: '02/04/2024', dictaminador: 'Luis Torres' },
    { folio: 'F006', autoridad: 'Comisión Nacional Bancaria', fecha: '04/04/2024', fechaCaptura: '03/04/2024', dictaminador: 'María Hernández' },
    { folio: 'F007', autoridad: 'Secretaría de Hacienda', fecha: '05/04/2024', fechaCaptura: '04/04/2024', dictaminador: 'Juan Rodríguez' },
    { folio: 'F008', autoridad: 'Instituto Fiscal', fecha: '06/04/2024', fechaCaptura: '05/04/2024', dictaminador: 'Carlos Sánchez' }
  ];

  // Datos filtrados de la tabla
  asuntosFiltrados: any[] = [];
  dictaminadorSeleccionado: string = '';

  // Mapeo de ID de dictaminador a nombre para mostrar mensajes
  dictaminadoresMap: { [key: string]: string } = {
    '1': 'María Hernández',
    '2': 'Juan Rodríguez',
    '3': 'Carlos Sánchez',
    '4': 'Ana González',
    '5': 'Luis Torres'
  };

  // Conteo de asuntos por dictaminador
  conteoAsuntosPorDictaminador: { [key: string]: number } = {};
  totalAsuntos: number = 0;

  // Propiedades para visualizar PDF
  mostrarPDFViewer = false;
  pdfTitulo = '';
  pdfUrl: string = '';
  pdfCargando = true;
  paginaActual = 1;
  escalaZoom = 1.0;

  // Propiedades para el modal de detalles
  mostrarDetalleModal: boolean = false;
  asuntoSeleccionado: any = null;

  // Propiedades para manejar asuntos rechazados
  // mostrarTablaRechazadosModal: boolean = false;
  // mostrarModalRechazados: boolean = false;
  mostrarConfirmacionReasignacion: boolean = false;
  // asuntoRechazado: any | null = null;


  // Datos de ejemplo para asuntos rechazados
  /* Eliminado: datos de rechazados
  asuntosRechazados: any[] = [
    { folio: 'R001', autoridad: 'Servicio de Administración Tributaria', fechaRechazo: '05/04/2024', dictaminador: 'María Hernández', motivo: 'Información incompleta en el expediente. Se requiere documentación adicional.' },
    { folio: 'R002', autoridad: 'Secretaría de Finanzas', fechaRechazo: '03/04/2024', dictaminador: 'Juan Rodríguez', motivo: 'No corresponde a esta área. Debe ser reasignado a otra administración.' }
  ];*/

  // Dictaminadores disponibles para reasignación
  // dictaminadoresDisponibles: any[] = [
  //   { id: '1', nombre: 'María Hernández' },
  //   { id: '2', nombre: 'Juan Rodríguez' },
  //   { id: '3', nombre: 'Carlos Sánchez' },
  //   { id: '4', nombre: 'Ana González' },
  //   { id: '5', nombre: 'Luis Torres' }
  // ];


  requerimiento: Cards = {
    total: 0,
    parcial: 0,
    recibido: 0,
    en_tramite: 0,
    no_aplica: 0,
    documento: 0,
  }

  administracion: AdministracionResponse = {
    Administracion: 0,
  }

  // Nuevas propiedades para manejar asuntos en atención y por aprobar
  asuntosEnAtencion: tableAsuntosPorDictaminar[] = [];
  asuntosPorAprobar: tableAsuntosPorDictaminar[] = [];
  vistaActual: 'atencion' | 'aprobacion' = 'atencion';
  cargandoAsuntos: boolean = false;
  cargandoAprobaciones: boolean = false;

  // Propiedades para la paginación
  paginaActualTabla: number = 1;
  filasPorPagina: number = 5;
  opcionesPaginacion: number[] = [5, 10, 15, 20];
  totalPaginas: number = 1;
  asuntosPaginados: tableAsuntosPorDictaminar[] = [];

  // Propiedades para el modal de revisión
  mostrarModalRevision: boolean = false;
  asuntoSeleccionadoRevision: any = null;
  archivosAsunto: ArchivoAdjunto[] = [];

  // Propiedades para el modal de atención
  mostrarModalAtencion: boolean = false;
  asuntoSeleccionadoAtencion: any = null;



  ngOnInit(): void {
    // Al iniciar, mostrar todos los asuntos
    this.asuntosFiltrados = [...this.asuntos];
    this.totalAsuntos = this.asuntos.length;

    // Calcular conteo de asuntos por dictaminador
    this.calcularConteoAsuntos();

    this.mostrarCards()

    // Cargar ambos tipos de asuntos
    this.cargarAsuntosEnAtencion();
    this.cargarAsuntosPorAprobar();

    this.usuariosPorAdministracion()

    // 🎨 INICIALIZAR NUEVO SISTEMA DE FILTROS
    this.inicializarFiltrosCarrusel();

    // Inicializar la paginación
    this.aplicarPaginacion();


  }

  // (El conteo 'Por asignar' ahora se obtiene con contarAsuntosPorEstadoAtencion)

  mostrarCards() {
    // Cargar tarjetas generales
    this.cards.cardsInfo().subscribe(res => {
      this.dataCards(res)
      this.requerimiento.parcial
      this.administracion.Administracion
    })

    // Cargar total "Por asignar" desde endpoint específico
    this.cards
      .contarAsuntosPorEstadoAtencion({ documento: this.documento, estado_atencion: 'POR ASIGNAR' })
      .subscribe({
        next: (resp) => {
          this.porAsignarTotal = resp?.total ?? 0;
        },
        error: () => {
          this.porAsignarTotal = 0;
        },
      });
  }

  cargarAsuntosEnAtencion() {
    this.cargandoAsuntos = true;
    const params = {
      documento: this.documento,
      estado_atencion: 'EN DICTAMINACION'
    };

    this.cards.asutosPorDictaminar(params).subscribe({
      next: (res) => {
        this.asuntosEnAtencion = res;
        console.log("TT", res);

        // 🎨 ACTUALIZAR SISTEMA NUEVO DE FILTROS
        this.extraerDictaminadoresUnicos();
        this.filtrarAsuntosAtencion();

        if (this.vistaActual === 'atencion') {
          this.actualizarTablaSegunVista();
          this.regenerarPaginacionRapida();
        }

        // Actualizar conteo de asuntos urgentes
        const fitrarPlazo = res.filter((item: any) => item.plazo_atencion !== null);
        this.asuntosUrgentes = fitrarPlazo.length;

        // 🔥 FORZAR VALOR DE PRUEBA PARA VER EL BANNER (REMOVER DESPUÉS)
        if (this.asuntosUrgentes === 0) {
          this.asuntosUrgentes = 3; // Valor de prueba
          console.log('🔥 Banner urgente forzado con valor de prueba:', this.asuntosUrgentes);
        }
        this.cargandoAsuntos = false;
      },
      error: (err) => {
        console.error('Error al cargar asuntos en atención:', err);
        this.cargandoAsuntos = false;
      }
    });
  }

  cargarAsuntosPorAprobar() {
    this.cargandoAprobaciones = true;
    const params = {
      documento: this.documento,
      estado_atencion: 'VISTO BUENO AKAMBA 3'
    };

    this.cards.asuntosPorAprobar(params).subscribe({
      next: (res) => {
        this.asuntosPorAprobar = res;

        // 🎨 ACTUALIZAR SISTEMA NUEVO DE FILTROS
        this.extraerDictaminadoresUnicos();
        this.filtrarAsuntosPorAprobar();

        if (this.vistaActual === 'aprobacion') {
          this.actualizarTablaSegunVista();
          this.regenerarPaginacionRapida();
        }

        this.cargandoAprobaciones = false;
      },
      error: (err) => {
        console.error('Error al cargar asuntos por aprobar:', err);
        this.cargandoAprobaciones = false;
      }
    });
  }

  // 🎨 MÉTODO MEJORADO: Cambiar vista con nuevo sistema
  cambiarVista(vista: 'atencion' | 'aprobacion') {
    console.log('🎨 Cambiando vista a:', vista);
    this.vistaActual = vista;
    this.actualizarTablaSegunVista();
    this.regenerarPaginacionRapida();
  }

  // 🎨 NUEVO: Inicializar el sistema de filtros tipo carrusel
  private inicializarFiltrosCarrusel(): void {
    // Extraer dictaminadores únicos de ambas vistas
    this.extraerDictaminadoresUnicos();

    // Inicializar datos filtrados
    this.asuntosEnAtencionFiltrados = [...this.asuntosEnAtencion];
    this.asuntosPorAprobarFiltrados = [...this.asuntosPorAprobar];

    // Establecer tabla inicial según vista actual
    this.actualizarTablaSegunVista();
  }

  // 🎨 NUEVO: Extraer dictaminadores únicos de manera eficiente
  private extraerDictaminadoresUnicos(): void {
    const todosAsuntos = [...this.asuntosEnAtencion, ...this.asuntosPorAprobar];
    const dictaminadoresSet = new Set<string>();

    todosAsuntos.forEach(asunto => {
      const dictaminador = (asunto as any).rfc_asignado || asunto.nombre_dictaminador;
      if (dictaminador && dictaminador.trim()) {
        dictaminadoresSet.add(dictaminador.trim());
      }
    });

    this.dictaminadoresUnicos = Array.from(dictaminadoresSet).sort();
    console.log('🎨 Dictaminadores únicos extraídos:', this.dictaminadoresUnicos);
  }

  // 🎨 NUEVO: Seleccionar dictaminador desde el carrusel
  seleccionarDictaminadorCarrusel(dictaminador: string): void {
    console.log('🎨 Seleccionando dictaminador:', dictaminador, 'en vista:', this.vistaActual);

    if (this.vistaActual === 'atencion') {
      this.dictaminadorActivoAtencion = this.dictaminadorActivoAtencion === dictaminador ? '' : dictaminador;
      this.filtrarAsuntosAtencion();
    } else {
      this.dictaminadorActivoAprobacion = this.dictaminadorActivoAprobacion === dictaminador ? '' : dictaminador;
      this.filtrarAsuntosPorAprobar();
    }

    this.actualizarTablaSegunVista();
    this.regenerarPaginacionRapida();
  }

  // 🎨 NUEVO: Filtrar asuntos de "En Atención"
  private filtrarAsuntosAtencion(): void {
    if (!this.dictaminadorActivoAtencion) {
      this.asuntosEnAtencionFiltrados = [...this.asuntosEnAtencion];
    } else {
      this.asuntosEnAtencionFiltrados = this.asuntosEnAtencion.filter(asunto => {
        const dictaminador = (asunto as any).rfc_asignado || asunto.nombre_dictaminador;
        return dictaminador?.trim() === this.dictaminadorActivoAtencion;
      });
    }
  }

  // 🎨 NUEVO: Filtrar asuntos de "Por Aprobar"
  private filtrarAsuntosPorAprobar(): void {
    if (!this.dictaminadorActivoAprobacion) {
      this.asuntosPorAprobarFiltrados = [...this.asuntosPorAprobar];
    } else {
      this.asuntosPorAprobarFiltrados = this.asuntosPorAprobar.filter(asunto => {
        const dictaminador = (asunto as any).rfc_asignado || asunto.nombre_dictaminador;
        return dictaminador?.trim() === this.dictaminadorActivoAprobacion;
      });
    }
  }

  // 🎨 NUEVO: Actualizar tabla según vista actual
  private actualizarTablaSegunVista(): void {
    if (this.vistaActual === 'atencion') {
      this.tablePorDictaminar = [...this.asuntosEnAtencionFiltrados];
    } else {
      this.tablePorDictaminar = [...this.asuntosPorAprobarFiltrados];
    }
  }

  // 🎨 NUEVO: Obtener dictaminador activo según vista
  get dictaminadorActivoActual(): string {
    return this.vistaActual === 'atencion' ? this.dictaminadorActivoAtencion : this.dictaminadorActivoAprobacion;
  }

  // 🎨 NUEVO: Verificar si un dictaminador está activo
  isDictaminadorActivo(dictaminador: string): boolean {
    return this.dictaminadorActivoActual === dictaminador;
  }

  // 🎨 NUEVO: Contar asuntos por dictaminador según vista actual
  contarAsuntosPorDictaminador(dictaminador: string): number {
    const asuntosVista = this.vistaActual === 'atencion' ? this.asuntosEnAtencion : this.asuntosPorAprobar;
    return asuntosVista.filter(asunto => {
      const dictaminadorAsunto = (asunto as any).rfc_asignado || asunto.nombre_dictaminador;
      return dictaminadorAsunto?.trim() === dictaminador;
    }).length;
  }

  // 🎨 NUEVO: Obtener iniciales del nombre (para avatar)
  obtenerIniciales(nombre: string): string {
    if (!nombre) return '';
    return nombre.split(' ')
      .map(n => n.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  // 🆕 FUNCIÓN AUXILIAR: Obtener dictaminador del asunto
  obtenerDictaminador(asunto: any): string {
    return asunto.rfc_asignado || asunto.nombre_dictaminador || '';
  }

  // 🆕 FUNCIONES AUXILIARES: Obtener datos anidados del JSON
  private obtenerDatos(asunto: any): any {
    // Estructuras posibles:
    // 1) { asunto: { tipo: 'Nuevo'|'Historico', datos: {...} }, rfc_asignado, ... }
    // 2) { asunto: { Nuevo: {...} } } o { asunto: { Historico: {...} } }
    // 3) { datos: {...} } (plano)
    // 4) { folio_interno, autoridad_remitente, ... } (plano legacy)
    if (!asunto) return {};
    const contenedor = asunto.asunto ?? asunto;
    if (contenedor?.datos) return contenedor.datos;
    if (contenedor?.Nuevo) return contenedor.Nuevo;
    if (contenedor?.Historico) return contenedor.Historico;
    if (asunto?.datos) return asunto.datos;
    return asunto;
  }

  obtenerFolioInterno(asunto: any): string {
    const d = this.obtenerDatos(asunto);
    return d?.folio_interno || '';
  }

  obtenerAutoridadRemitente(asunto: any): string {
    const d = this.obtenerDatos(asunto);
    return d?.autoridad_remitente || '';
  }

  obtenerFechaRecepcion(asunto: any): string {
    const d = this.obtenerDatos(asunto);
    return d?.fecha_recepcion || '';
  }

  obtenerPersonaRelacionada(asunto: any): string {
    const d = this.obtenerDatos(asunto);
    return d?.persona_relacionada || '';
  }

  // 🎨 NUEVO: Método para seleccionar una fila (requerido por la tabla)
  seleccionarFila(folio: string): void {
    const asuntosFiltrados = this.vistaActual === 'atencion' ? this.asuntosEnAtencionFiltrados : this.asuntosPorAprobarFiltrados;
    const asunto = asuntosFiltrados.find(a => this.obtenerFolioInterno(a) === folio);
    if (asunto) {
      console.log('🎨 Asunto seleccionado:', asunto);
    }
  }

  // 🎨 NUEVO: Limpiar filtro de la vista actual
  limpiarFiltroCarrusel(): void {
    if (this.vistaActual === 'atencion') {
      this.dictaminadorActivoAtencion = '';
      this.filtrarAsuntosAtencion();
    } else {
      this.dictaminadorActivoAprobacion = '';
      this.filtrarAsuntosPorAprobar();
    }

    this.actualizarTablaSegunVista();
    this.regenerarPaginacionRapida();
  }

  // 🎨 NUEVO: Paginación súper rápida
  private regenerarPaginacionRapida(): void {
    this.pages = [];
    this.pageSelected = 1;

    for (let i = 0; i < this.tablePorDictaminar.length; i += this.itemsPerPage) {
      this.pages.push(this.tablePorDictaminar.slice(i, i + this.itemsPerPage));
    }
  }

  // Método para aplicar la paginación a la tabla actual
  aplicarPaginacion(): void {
    const inicio = (this.paginaActualTabla - 1) * this.filasPorPagina;
    const fin = inicio + this.filasPorPagina;

    this.asuntosPaginados = this.tablePorDictaminar.slice(inicio, fin);
    this.totalPaginas = Math.ceil(this.tablePorDictaminar.length / this.filasPorPagina);
  }

  // Método para cambiar la página actual
  cambiarPaginaTabla(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActualTabla = pagina;
      this.aplicarPaginacion();
    }
  }

  // Método para cambiar el número de filas por página
  cambiarFilasPorPagina(filas: any): void {
    this.filasPorPagina = parseInt(filas, 10);
    this.paginaActualTabla = 1; // Resetear a la primera página
    this.aplicarPaginacion();
  }

  // Método para ir a la página anterior
  paginaAnteriorTabla(): void {
    if (this.paginaActualTabla > 1) {
      this.paginaActualTabla--;
      this.aplicarPaginacion();
    }
  }

  // Método para ir a la página siguiente
  paginaSiguienteTabla(): void {
    if (this.paginaActualTabla < this.totalPaginas) {
      this.paginaActualTabla++;
      this.aplicarPaginacion();
    }
  }

  // Métodos para manejar acciones de aprobación
  aprobarAsunto(idAsunto: number, event: Event) {
    event.stopPropagation();
    // Por ahora solo mostramos un mensaje, la implementación real requeriría un servicio
    this.mostrarMensaje(`Aprobando asunto con ID: ${idAsunto}`);
    // Aquí iría la llamada al servicio para aprobar el asunto
  }

  rechazarAsunto(idAsunto: number, event: Event) {
    event.stopPropagation();
    // Por ahora solo mostramos un mensaje, la implementación real requeriría un modal
    this.mostrarMensaje(`Rechazando asunto con ID: ${idAsunto}`);
    // Aquí iría la lógica para abrir un modal de rechazo
  }

  // Mantener este método por compatibilidad con el código existente
  asuntosPorDictaminar() {
    this.cargarAsuntosEnAtencion();
  }

  dataCards(data: CardsResponse['data']): void {
    const cardsData = data.find(i => 'REQUERIMIENTO' in i) as { REQUERIMIENTO: Cards };
    if (cardsData) {
      this.requerimiento = cardsData.REQUERIMIENTO
    }
    const administracionObj = data.find(i => 'Administracion' in i) as { Administracion: AdministracionResponse };
    if (administracionObj) {
      this.administracion = administracionObj.Administracion;
    }
  }
  dataUrgentes(plazoAtencion: number) {
    const urgentes = this.tablePorDictaminar.find(u => u.plazo_atencion === plazoAtencion);
    console.log("URGEN", urgentes);
    return urgentes?.plazo_atencion
  }
  usuariosPorAdministracion() {
    this.cards.usuariosPorAdminitracion().subscribe((res: usuariosPorAdministracion[]) => {
      this.usuariosAsignar = res
    })
  }

  // Método para calcular conteo de asuntos por dictaminador
  calcularConteoAsuntos(): void {
    // Resetear conteos
    this.conteoAsuntosPorDictaminador = {};

    // Calcular conteos para cada dictaminador
    for (const asunto of this.asuntos) {
      if (!this.conteoAsuntosPorDictaminador[asunto.dictaminador]) {
        this.conteoAsuntosPorDictaminador[asunto.dictaminador] = 0;
      }
      this.conteoAsuntosPorDictaminador[asunto.dictaminador]++;
    }

    console.log('Conteo de asuntos por dictaminador:', this.conteoAsuntosPorDictaminador);
  }

  // Método para mostrar detalles según la categoría
  mostrarDetalle(categoria: string): void {
    console.log(`Mostrando detalle para: ${categoria}`);
    if (categoria === 'nuevos') {
      // Redireccionar a la página de trámite detalle
      this.router.navigate(['/layout/tramite-detalle']);
    } else if (categoria === 'pendientes') {
      // Redireccionar a la página de asuntos parciales
      this.router.navigate(['/layout/parcial-detalle']);
    } else if (categoria === 'total') {
      // Redireccionar a la página de asuntos finalizados (tabla)
      this.router.navigate(['/layout/finalizado-card']);
    } else {
      // Para otros casos mantenemos el comportamiento anterior
      let mensaje = '';

      switch (categoria) {
        default:
          mensaje = 'Mostrando detalles de asuntos';
      }

      this.mostrarMensaje(mensaje);
    }
  }

  // Método para ver detalle con el nuevo modal de revisión
  verDetalle(asunto: any, event: Event): void {
    event.stopPropagation();
    console.log('🔍 [verDetalle] ¡EJECUTÁNDOSE! Vista actual:', this.vistaActual);
    console.log('🔍 [verDetalle] Asunto recibido:', asunto);

    if (this.vistaActual === 'aprobacion') {
      // Para asuntos que requieren aprobación, usamos el modal de revisión
      console.log('✅ [verDetalle] Abriendo modal de REVISIÓN (Por Aprobar)');
      this.asuntoSeleccionadoRevision = asunto;

      // Cargar los archivos del asunto
      this.cargarArchivosAsunto(asunto);

      // Mostrar el modal
      this.mostrarModalRevision = true;
    } else {
      // Para asuntos en atención, usamos el nuevo modal de atención
      console.log('✅ [verDetalle] Abriendo modal de ATENCIÓN (En Atención)');
      console.log('✅ [verDetalle] Asignando asunto a asuntoSeleccionadoAtencion:', asunto);
      this.asuntoSeleccionadoAtencion = asunto;

      // Mostrar el modal
      console.log('✅ [verDetalle] Estableciendo mostrarModalAtencion = true');
      this.mostrarModalAtencion = true;

      console.log('✅ [verDetalle] Estado final:');
      console.log('  - mostrarModalAtencion:', this.mostrarModalAtencion);
      console.log('  - asuntoSeleccionadoAtencion:', this.asuntoSeleccionadoAtencion);
    }
  }

  // Método para cargar los archivos del asunto
  cargarArchivosAsunto(asunto: any): void {
    console.log('🔧 [Cards] cargarArchivosAsunto iniciado');
    console.log('🔧 [Cards] Asunto recibido:', asunto);

    if (!asunto || !asunto.folio_interno) {
      console.log('🔧 [Cards] No hay asunto o folio_interno, limpiando archivos');
      this.archivosAsunto = [];
      return;
    }

    console.log('🔧 [Cards] Llamando servicio para folio:', asunto.folio_interno);
    this.archivosService.listarArchivosPdf(asunto.folio_interno).subscribe({
      next: (archivos) => {
        console.log('🔧 [Cards] Respuesta del servicio archivos:', archivos);
        console.log('🔧 [Cards] Número de archivos recibidos:', archivos?.length || 0);
        this.archivosAsunto = archivos;
        console.log('🔧 [Cards] archivosAsunto asignado:', this.archivosAsunto);
      },
      error: (err) => {
        console.error('🔧 [Cards] Error al cargar archivos del asunto:', err);
        console.error('🔧 [Cards] Detalles del error:', {
          status: err.status,
          statusText: err.statusText,
          message: err.message,
          url: err.url
        });
        this.archivosAsunto = [];
      }
    });
  }

  // Método para cerrar el modal de detalles
  cerrarDetalle(): void {
    this.mostrarDetalleModal = false;
    this.asuntoSeleccionado = null;
  }

  // Método para cerrar el modal de revisión
  cerrarModalRevision(): void {
    this.mostrarModalRevision = false;
    this.asuntoSeleccionadoRevision = null;
    this.archivosAsunto = [];
  }

  // Método para aprobar un asunto
  aprobarAsuntoRevision(datos: { id: number, observaciones: string, tipoAprobacion: 'parcial' | 'total' }): void {
    console.log('Aprobando asunto:', datos);

    // Refrescar datos desde backend y quitar el asunto de la lista
    const tipoTexto = datos.tipoAprobacion === 'parcial' ? 'Parcial' : 'Total';
    this.mostrarMensaje(`Asunto ${datos.id} aprobado como Atención ${tipoTexto}`);

    // Actualizar listas desde el servidor para reflejar cambio de estado
    this.cargarAsuntosPorAprobar();
    this.cargarAsuntosEnAtencion();
    this.actualizarTablaSegunVista();
  }

  // Método para rechazar un asunto
  rechazarAsuntoRevision(datos: { id: number, observaciones: string, motivo: string }): void {
    console.log('Rechazando asunto:', datos);

    // Refrescar datos tras rechazo
    this.mostrarMensaje(`Asunto ${datos.id} rechazado definitivamente por: ${datos.motivo}`);

    this.cargarAsuntosPorAprobar();
    this.cargarAsuntosEnAtencion();
    this.actualizarTablaSegunVista();
  }

  // Método para regresar un asunto al dictaminador
  regresarAsuntoRevision(datos: { id: number, observaciones: string, motivo: string }): void {
    console.log('Regresando asunto al dictaminador:', datos);

    // Refrescar datos tras regreso (rechazo)
    this.mostrarMensaje(`Asunto ${datos.id} regresado al dictaminador: ${datos.motivo}`);

    this.cargarAsuntosPorAprobar();
    this.cargarAsuntosEnAtencion();
    this.actualizarTablaSegunVista();
  }

  // Método para visualizar PDF
  verPDF(folio: string, event: Event): void {
    event.stopPropagation();
    this.pdfTitulo = `Documento ${folio}`;
    // Usar un PDF de ejemplo disponible públicamente
    this.pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    this.pdfCargando = true;
    this.mostrarPDFViewer = true;
    this.paginaActual = 1;
    this.escalaZoom = 1.0;

    // Simular tiempo de carga
    setTimeout(() => {
      this.pdfCargando = false;
    }, 1500);
  }

  // Método para descargar PDF desde la tabla
  descargarPDF(folio: string, event: Event): void {
    event.stopPropagation(); // Evita que se active el seleccionarFila

    // En una aplicación real, esto generaría una descarga del archivo PDF
    // Para este ejemplo, solo mostramos un mensaje
    this.mostrarMensaje(`Descargando documento del asunto ${folio}`);

    // Simular descarga después de 1 segundo
    setTimeout(() => {
      // Aquí se iniciaría la descarga real
      console.log(`Descarga iniciada para ${folio}`);
    }, 1000);
  }

  // Métodos para control de páginas
  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente(): void {
    // Asumimos un máximo de 10 páginas para este ejemplo
    if (this.paginaActual < 10) {
      this.paginaActual++;
    }
  }

  // Métodos para control de zoom
  aumentarZoom(): void {
    this.escalaZoom += 0.25;
    if (this.escalaZoom > 3) this.escalaZoom = 3;
    this.aplicarZoom();
  }

  disminuirZoom(): void {
    this.escalaZoom -= 0.25;
    if (this.escalaZoom < 0.5) this.escalaZoom = 0.5;
    this.aplicarZoom();
  }

  pantallaCompleta(): void {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        iframe.requestFullscreen();
      }
    }
  }

  aplicarZoom(): void {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      (iframe as HTMLElement).style.transform = `scale(${this.escalaZoom})`;
      (iframe as HTMLElement).style.transformOrigin = 'center top';
    }
  }

  // Método para descargar el PDF actual
  descargarPDFActual(): void {
    // Crear un enlace temporal y simular clic
    const link = document.createElement('a');
    link.href = this.pdfUrl;
    link.download = `${this.pdfTitulo.replace(/\s+/g, '_')}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Método para cambiar página
  cambiarPagina(pagina: number | string): void {
    if (typeof pagina === 'number') {
      this.mostrarMensaje(`Mostrando página ${pagina}`);
    } else if (pagina === 'anterior') {
      this.mostrarMensaje('Mostrando página anterior');
    } else if (pagina === 'siguiente') {
      this.mostrarMensaje('Mostrando página siguiente');
    }
  }

  /**
   * Muestra un mensaje de notificación al usuario
   * @param mensaje Texto a mostrar
   * @param duracion Duración en milisegundos (por defecto 2000ms)
   */
  mostrarMensaje(mensaje: string, duracion: number = 2000): void {
    // Solo se registra el mensaje en consola sin mostrar la notificación visual
    console.log('Mensaje de sistema:', mensaje);

    // No se activa la notificación visual
    // this.mensajeNotificacion = mensaje;
    // this.mostrarNotificacion = true;
    // setTimeout(() => {
    //   this.mostrarNotificacion = false;
    // }, duracion);
  }

  // Método para ir a la vista de Asuntos por Asignar
  irAAsignacion(): void {
    this.router.navigate(['/layout/asignacion']);
  }

  // 🚨 NUEVO: Método para ir a la vista de Asuntos Urgentes
  irAAsignacionUrgentes(): void {
    console.log('🚨 [CardsComponent] Navegando a asuntos urgentes');

    // Navegar a la página de asignación con parámetros de filtro para urgentes
    this.router.navigate(['/layout/asignacion'], {
      queryParams: {
        filtro: 'urgentes',
        plazo: '0',
        vista: 'urgentes'
      }
    });
  }

  // Método para visualizar PDF alternativo
  verPDFAlternativo(event: Event): void {
    event.stopPropagation();
    this.pdfTitulo = 'Documento de ejemplo (Mozilla)';
    // Usar un PDF de ejemplo de Mozilla
    this.pdfUrl = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
    this.pdfCargando = true;
    this.mostrarPDFViewer = true;
    this.paginaActual = 1;
    this.escalaZoom = 1.0;

    // Simular tiempo de carga
    setTimeout(() => {
      this.pdfCargando = false;
    }, 1500);
  }

  // Métodos para gestionar asuntos rechazados
  // mostrarTablaRechazados(): void {
  //   this.mostrarTablaRechazadosModal = true;
  // }

  // cerrarTablaRechazados(): void {
  //   this.mostrarTablaRechazadosModal = false;
  // }

  seleccionarAsuntoRechazado(asunto: any): void {
    // this.asuntoRechazado = asunto;
    // this.mostrarTablaRechazadosModal = false;
    // this.mostrarModalRechazados = true;
  }

  // cerrarModalRechazados(): void {
  //   this.mostrarModalRechazados = false;
  // }

  manejarReasignacion(event: { asunto: any, nuevoDictaminadorId: string, observaciones: string, notificar: boolean }): void {
    // Implementar la lógica para reasignar el asunto rechazado a un nuevo dictaminador
    console.log('Reasignando asunto', event);
    this.mostrarMensaje(`Asunto reasignado a ${this.dictaminadoresMap[event.nuevoDictaminadorId]}`);
    // this.cerrarModalRechazados();
  }

  confirmarReasignacion(): void {
    // Aquí se realizaría la llamada al servicio para reasignar el asunto
    setTimeout(() => {
      // Simular respuesta exitosa
      this.mostrarMensaje('Asunto reasignado exitosamente');
      // Actualizar la lista de asuntos rechazados (quitar el asunto reasignado)
      // if (this.asuntoRechazado) {
      //   this.asuntosRechazados = this.asuntosRechazados.filter(a => a.folio !== this.asuntoRechazado?.folio);
      // }
      this.mostrarConfirmacionReasignacion = false;
      // this.mostrarModalRechazados = false;
      // this.asuntoRechazado = null;
    }, 1000);
  }

  cancelarConfirmacionReasignacion(): void {
    this.mostrarConfirmacionReasignacion = false;
  }

  // Método para crear un componente de revisión de dictamen
  revisarDictamen(folio: string, event: Event): void {
    event.stopPropagation();
    // Aquí iría la lógica para abrir el modal de revisión
    this.mostrarMensaje('Abriendo revisión de dictamen: ' + folio);
  }

  // Método para cerrar el visor de PDF
  cerrarPDF(): void {
    this.mostrarPDFViewer = false;
    this.pdfTitulo = '';
    this.pdfUrl = '';
    this.pdfCargando = true;
  }

  // Método auxiliar para calcular el mínimo entre dos números (usado en la paginación)
  minimo(a: number, b: number): number {
    return Math.min(a, b);
  }

  // Método para cerrar el modal de atención
  cerrarModalAtencion(): void {
    this.mostrarModalAtencion = false;
    this.asuntoSeleccionadoAtencion = null;
  }

  verAsuntoEnAtencion(asunto: any): void {
    this.asuntoSeleccionado = asunto;
    this.mostrarModalAtencion = true;
  }


}
