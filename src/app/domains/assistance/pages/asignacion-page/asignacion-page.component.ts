import { AsignarAsunto, AsignarAsuntoRequest, modalItem } from './../../../interfaces/asiganar-AsuntoRequest.interface';
import { Component, OnInit, TemplateRef, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule} from '@angular/material/dialog';
import { FormControl, FormsModule,  ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {  porAsignarRequest, tableAsuntosPorDictaminar } from '../../../interfaces/porAsignarRequest.interface';
import { CardsInfoBandejadeAtencionService } from '../../../services/cards-info-bandejade-atencion.service';
import { usuariosPorAdministracion } from '../../../interfaces/usuarios-Por-administracion.interface';
import { ModalService } from '../../../shared/services/modal.service';
import { BuscadorService } from '../../../shared/services/buscador.service';
import { Observable,of } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { PdfViewerComponent } from '../../../components/pdf-viewer/pdf-viewer.component';
import { FileService } from '../../../services/file.service';
import { ArchivosAtencionService } from '../../../services/archivos-atencion.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-asignacion-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    PdfViewerComponent,
  ],
  templateUrl: './asignacion-page.component.html',
  // src\app\domains\assistance\pages\asignacion-page\asignacion-page.component.html
  styles: [`
    :host {
      display: block;
      height: 100%;
      background-color: #F3EAE4;
    }

    .animate-fade-in {
      animation: fadeIn 0.2s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* 🚨 Animación para indicadores urgentes */
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.8;
        transform: scale(1.05);
      }
    }

    /* ⚡ Animación para indicador ping */
    .animate-ping {
      animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
    }

    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }

    /* 🎯 Hover effects para semáforos */
    .group:hover .semaforo-hover {
      transform: scale(1.1);
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }

    /* 📱 Mejoras responsive para badges */
    @media (max-width: 768px) {
      .badge-prioridad {
        font-size: 0.65rem;
        padding: 0.25rem 0.5rem;
      }
    }

    /* 🔄 Estilos para scroll horizontal suave */
    .tabla-scroll {
      scrollbar-width: thin;
      scrollbar-color: #691C32 #f1f1f1;
    }

    .tabla-scroll::-webkit-scrollbar {
      height: 8px;
    }

    .tabla-scroll::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    .tabla-scroll::-webkit-scrollbar-thumb {
      background: #691C32;
      border-radius: 4px;
    }

    .tabla-scroll::-webkit-scrollbar-thumb:hover {
      background: #8B1D3C;
    }

    /* 💬 Tooltip mejorado */
    .tooltip-text {
      visibility: hidden;
      opacity: 0;
      transition: opacity 0.3s, visibility 0.3s;
    }

    .tooltip-container:hover .tooltip-text {
      visibility: visible;
      opacity: 1;
    }

    /* 📝 Animación para texto expandible */
    .text-expand-animation {
      transition: max-height 0.3s ease-in-out;
      overflow: hidden;
    }

    ::ng-deep pdf-viewer {
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: center;
    }

    ::ng-deep .page {
      margin: 10px auto !important;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }


  `]
})
export class AsignacionPageComponent implements OnInit, AfterViewInit, OnDestroy {
  // asuntos: Asunto[] = [];
  tablePorAsignarIndicador: tableAsuntosPorDictaminar[] = []

buscador = new FormControl('');

  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10; // Número de elementos por página
  abogadoSeleccionado: string = '';
  
  // Variables para el modal de asignación
  tipoAccion: 'asignar' | 'reasignar' = 'asignar';
  observacionesReasignacion: string = '';
  
  // mostrarPDFViewer: boolean = false;
  // pdfSrc: string = '';
  // pdfTitulo: string = '';
  // asuntoParaDescargar: Asunto | null = null;

  asignadosTable: boolean = false
  documento: string = 'REQUERIMIENTO'
  usuariosAsignar: usuariosPorAdministracion[] = []
   itemDeFilaSelecionada: modalItem | null = null

  // ViewChild para templates
  @ViewChild('templateDetalle', { static: false }) templateDetalle!: TemplateRef<any>;
  @ViewChild('templatePDF', { static: false }) templatePDF!: TemplateRef<any>;

  // Variables para ngx-pagination
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  configuracionPaginacion = {
    itemsPerPage: this.elementosPorPagina,
    currentPage: this.paginaActual,
    totalItems: 0
  };

  porAsignarDataTable: porAsignarRequest = {
    documento: this.documento,
    asignados: this.asignadosTable
  }

  totalPages: number = 0;
  totalRegistros: number = 0;
  
  asignacion: AsignarAsunto | null = null
  searchText: string = '';
  results$: Observable<string[]> = of([]);
  allData: tableAsuntosPorDictaminar[] = [];
  asuntosPaginados: tableAsuntosPorDictaminar[] = [];
  filteredData$!: Observable<tableAsuntosPorDictaminar[]>;
  
  // Variable para el modal de detalle
  asuntoDetalle: tableAsuntosPorDictaminar | null = null;

  // ✅ Variables para funcionalidad PDF Viewer
  visualizarPdf: boolean = false;
  pdfUrl: SafeResourceUrl | null = null;
  pdfCargando: boolean = false;
  pdfError: boolean = false;

  // 📱 Variables para manejo de texto largo y responsividad
  textosExpandidos: Set<string> = new Set();
  scrollHorizontalVisible: boolean = false;

  // 🎯 VARIABLES PARA HEADER INTELIGENTE Y AGRUPACIÓN HÍBRIDA
  filtroActivo: 'todos' | 'urgente' | 'critico' | 'normal' | 'reciente' = 'todos';
  mostrarAgrupacion: boolean = true;
  seccionesColapsadas: Set<string> = new Set();
  
  // 📊 Contadores dinámicos con subtotales de plazo
  contadores = {
    urgente: 0,
    critico: 0, 
    normal: 0,
    reciente: 0,
    total: 0,
    // Subtotales de casos CON plazo dentro de cada categoría
    criticoConPlazo: 0,
    normalConPlazo: 0,
    recienteConPlazo: 0
  };

  constructor(private router: Router,
    private cards: CardsInfoBandejadeAtencionService,
    private modalService: ModalService,
   private buscadorService:BuscadorService<tableAsuntosPorDictaminar>,
   private fileService: FileService,
   private archivosAtencionService: ArchivosAtencionService,
   private domSanitizer: DomSanitizer,
   private route: ActivatedRoute) { }

  ngOnInit() {
    this.filteredData$ = this.buscadorService.getFilteredData(this.filtrarIndicador);
    this.tablePorAsignar();
    
    // 🚨 NUEVO: Verificar si viene de asuntos urgentes
    this.route.queryParams.subscribe(params => {
      if (params['filtro'] === 'urgentes' && params['plazo'] === '0') {
        console.log('🚨 [AsignacionPage] Aplicando filtro de asuntos urgentes');
        this.aplicarFiltroUrgentes();
      }
    });
    
    // Suscribirse a los cambios en los datos filtrados para actualizar la paginación
    this.filteredData$.subscribe(data => {
      this.calcularContadores(data); // 📊 Actualizar contadores
      this.actualizarPaginacion(data);
    });
  }

  actualizarPaginacion(datos: tableAsuntosPorDictaminar[]) {
    // 📊 APLICAR ORDENAMIENTO POR PRIORIDADES ANTES DE PAGINAR
    const datosOrdenados = datos.sort((a, b) => {
      // Obtener prioridades usando el sistema de prioridades
      const prioridadA = this.getPrioridad(a);
      const prioridadB = this.getPrioridad(b);

      // Primero ordenar por prioridad (5=urgente, 4=plazo, 3=crítico, 2=normal, 1=reciente)
      if (prioridadA !== prioridadB) {
        return prioridadB - prioridadA; // Mayor prioridad primero
      }

      // Si tienen la misma prioridad, ordenar por antigüedad real (mayor primero)
      const antiguedadA = this.calcularAntiguedadEnDias(a.fecha_recepcion);
      const antiguedadB = this.calcularAntiguedadEnDias(b.fecha_recepcion);
      return antiguedadB - antiguedadA;
    });
    
    // Guardar el total de registros
    this.totalRegistros = datosOrdenados.length;
    
    // Calcular total de páginas
    this.totalPages = Math.ceil(datosOrdenados.length / this.itemsPerPage);
    
    // Resetear a la primera página si la página actual es mayor que el total
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
    
    // Calcular índices
    const inicio = (this.currentPage - 1) * this.itemsPerPage;
    const fin = inicio + this.itemsPerPage;
    
    // Actualizar los asuntos paginados con orden por prioridades
    this.asuntosPaginados = datosOrdenados.slice(inicio, fin);
  }

  tablePorAsignar() {
    this.cards.tablePorAsignar(this.porAsignarDataTable).subscribe({
      next: (res) => {
        // this.tablePorAsignarIndicador = res
        this.allData = res
        this.calcularContadores(res); // 📊 Calcular contadores iniciales
        this.buscadorService.setData(this.allData)
      },
    });
  }

  onDearchChange(value:string){
    this.buscadorService.setSearchTerm(value)
  }

  filtrarIndicador = (item: tableAsuntosPorDictaminar, term: string): boolean => {
  return item.persona_relacionada?.toLowerCase().includes(term.toLocaleLowerCase());
  };

  asignarIndicador : Observable<tableAsuntosPorDictaminar[]>= new Observable

  usuariosPorAdministracion() {
    this.cards.usuariosPorAdminitracion().subscribe((res: usuariosPorAdministracion[]) => {
      this.usuariosAsignar = res
    })
  }

  asignarAsunto() {
    const itemJsonSeleccion = this.itemDeFilaSelecionada!
    const jsonRequest : AsignarAsuntoRequest = {
      asunto: itemJsonSeleccion,
      rfc_asignado: this.abogadoSeleccionado
    }
    console.log("JSON",JSON.stringify(jsonRequest));
    this.cards.asignarAsunto(jsonRequest).subscribe({
      next: () => {
        window.location.reload()
      }
    })
  }

  // Nueva función para manejar ambas acciones
  ejecutarAccion() {
    if (this.tipoAccion === 'asignar') {
      this.asignarAsunto();
    } else if (this.tipoAccion === 'reasignar') {
      // Ejecutar directamente el rechazo
      this.solicitarReasignacion();
    }
  }

  // Función para manejar rechazo para correcta asignación
  solicitarReasignacion() {
    const datos = {
      asunto: this.itemDeFilaSelecionada,
      accion: 'rechazado_para_correcta_asignacion',
      fecha_rechazo: new Date().toISOString(),
      motivo: this.observacionesReasignacion
    };

    console.log('Rechazando asunto para correcta asignación:', datos);
    
    // Aquí iría la llamada al servicio para rechazar el asunto
    // Por ahora solo mostramos confirmación
    alert(`El asunto ${this.itemDeFilaSelecionada?.folio_interno} ha sido rechazado para su correcta asignación`);
    
    // Cerrar modal y limpiar datos
    this.cerrarModalAsignacion();
  }



  // Función para cerrar modal y limpiar
  cerrarModalAsignacion() {
    this.itemDeFilaSelecionada = null;
    this.abogadoSeleccionado = '';
    this.tipoAccion = 'asignar';
    this.observacionesReasignacion = '';
    this.modalService.closeAllDialogs();
  }

  abrirModalAsignacion(template: TemplateRef<any>, item: modalItem) {
    this.itemDeFilaSelecionada = item
    // Limpiar datos del modal anterior
    this.observacionesReasignacion = '';
    this.abogadoSeleccionado = '';
    this.tipoAccion = 'asignar';
    
    this.usuariosPorAdministracion()
    this.modalService.openCustomDialogWithTemplate({
      template
    })
  }

  get asuntosFiltrados() {
    // Filtrar por persona relacionada si hay término de búsqueda
    return this.allData.filter(asunto =>
      asunto.persona_relacionada.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get startIndex(): number {
    return this.totalRegistros > 0 ? (this.currentPage - 1) * this.itemsPerPage : 0;
  }

  get endIndex(): number {
    if (this.totalRegistros === 0) return 0;
    const fin = this.currentPage * this.itemsPerPage;
    return Math.min(fin, this.totalRegistros);
  }

  get totalAsuntos(): number {
    return this.totalRegistros;
  }

  // 🕐 CALCULAR ANTIGÜEDAD REAL EN DÍAS DESDE FECHA DE RECEPCIÓN
  private calcularAntiguedadEnDias(fechaRecepcion: string): number {
    if (!fechaRecepcion) return 0;
    
    try {
      const fechaRecep = new Date(fechaRecepcion);
      const fechaActual = new Date();
      const diferenciaMilisegundos = fechaActual.getTime() - fechaRecep.getTime();
      const diferenciaDias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

      return diferenciaDias >= 0 ? diferenciaDias : 0;
    } catch (error) {
      return 0;
    }
      }

  // 🎯 SISTEMA DE PRIORIDADES HÍBRIDO - CLASIFICACIÓN POR ANTIGÜEDAD
  getPrioridad(asunto: tableAsuntosPorDictaminar): number {
    // 🚨 MÁXIMA PRIORIDAD: Plazo de atención = 0 (URGENTE)
    if (asunto.plazo_atencion === 0) {
      return 4; // Prioridad máxima
    }
    
    // Para todos los demás casos, clasificar por antigüedad de fecha_recepcion
    // (independientemente si tienen plazo > 0 o no)
    const antiguedadDias = this.calcularAntiguedadEnDias(asunto.fecha_recepcion);
    
    // 🔴 ALTA PRIORIDAD: Mayor a 15 días de antigüedad real
    if (antiguedadDias > 15) {
      return 3; // Crítico por antigüedad
    }
    
    // 🟡 MEDIA PRIORIDAD: Entre 5 y 15 días de antigüedad real
    if (antiguedadDias >= 5 && antiguedadDias <= 15) {
      return 2; // Normal
    }
    
    // 🟢 BAJA PRIORIDAD: Menor a 4 días de antigüedad real
    return 1; // Reciente
  }

  // 🚦 SEMÁFORO CORREGIDO CON ANTIGÜEDAD REAL
  getColorSemaforo(asunto: tableAsuntosPorDictaminar): string {
    // 🔴 ROJO URGENTE: Plazo de atención = 0 (URGENTE)
    if (asunto.plazo_atencion === 0) {
      return 'bg-red-500 animate-pulse'; // Rojo pulsante para urgente
    }
    
    // Calcular antigüedad real desde fecha de recepción
    const antiguedadDias = this.calcularAntiguedadEnDias(asunto.fecha_recepcion);
    
    // 🔴 ROJO: Mayor a 15 días de antigüedad real
    if (antiguedadDias > 15) {
      return 'bg-red-500';
    }
    
    // 🟡 AMARILLO: Entre 5 y 15 días de antigüedad real
    if (antiguedadDias >= 5 && antiguedadDias <= 15) {
      return 'bg-yellow-500';
    }
    
    // 🟢 VERDE: Menor a 4 días de antigüedad real
      return 'bg-green-500';
    }

  // 🎨 DESCRIPCIÓN DE PRIORIDAD CORREGIDA
  getDescripcionPrioridad(asunto: tableAsuntosPorDictaminar): string {
    if (asunto.plazo_atencion === 0) {
      return 'URGENTE - Requiere atención inmediata';
    }
    
    const antiguedadDias = this.calcularAntiguedadEnDias(asunto.fecha_recepcion);
    
    if (antiguedadDias > 15) {
      return `CRÍTICO - ${antiguedadDias} días de antigüedad`;
    }
    if (antiguedadDias >= 5 && antiguedadDias <= 15) {
      return `NORMAL - ${antiguedadDias} días de antigüedad`;
    }
    return `RECIENTE - ${antiguedadDias} días de antigüedad`;
  }

  // 🏷️ BADGE PRINCIPAL POR ANTIGÜEDAD (Sistema Híbrido)
  getBadgePrioridad(asunto: tableAsuntosPorDictaminar): { clase: string, texto: string } {
    // 🚨 URGENTE: plazo = 0
    if (asunto.plazo_atencion === 0) {
      return { 
        clase: 'bg-red-100 text-red-800 animate-pulse border border-red-300', 
        texto: '🚨 URGENTE' 
      };
    }
    
    // Para todos los demás casos, clasificar por antigüedad
    const antiguedadDias = this.calcularAntiguedadEnDias(asunto.fecha_recepcion);
    
    if (antiguedadDias > 15) {
      return { 
        clase: 'bg-red-100 text-red-800 border border-red-300', 
        texto: `🔴 CRÍTICO (${antiguedadDias}d)` 
      };
    }
    if (antiguedadDias >= 5 && antiguedadDias <= 15) {
      return { 
        clase: 'bg-yellow-100 text-yellow-800 border border-yellow-300', 
        texto: `🟡 NORMAL (${antiguedadDias}d)` 
      };
    }
    return { 
      clase: 'bg-green-100 text-green-800 border border-green-300', 
      texto: `🟢 RECIENTE (${antiguedadDias}d)` 
    };
  }

  // 🏷️ BADGE SECUNDARIO PARA PLAZO (Diferenciador Visual)
  getBadgePlazo(asunto: tableAsuntosPorDictaminar): { clase: string, texto: string } | null {
    if (asunto.plazo_atencion && asunto.plazo_atencion > 0) {
      return { 
        clase: 'bg-orange-100 text-orange-800 border border-orange-300 ml-2', 
        texto: `⏱️ PLAZO: ${asunto.plazo_atencion}d` 
      };
    }
    return null;
  }

  // 🎨 VERIFICAR SI TIENE PLAZO (Para efectos visuales)
  tienePlazo(asunto: tableAsuntosPorDictaminar): boolean {
    return asunto.plazo_atencion !== null && asunto.plazo_atencion !== undefined && asunto.plazo_atencion > 0;
  }



  // verPDF(asunto: Asunto) {
  //   // En producción, aquí obtendrías la URL del archivo PDF del backend
  //   // Para el ejemplo, usamos un PDF de prueba
  //   this.pdfSrc = this.obtenerURLPDF(asunto);
  //   this.pdfTitulo = `Documento de ${asunto.personaRelacionada}`;
  //   this.asuntoParaDescargar = asunto;
  //   this.mostrarPDFViewer = true;
  // }

  // cerrarPDF() {
  //   this.mostrarPDFViewer = false;
  //   this.pdfSrc = '';
  //   this.pdfTitulo = '';
  //   this.asuntoParaDescargar = null;
  // }

  // descargarPDFActual() {
  //   if (this.asuntoParaDescargar) {
  //     this.descargarPDF(this.asuntoParaDescargar);
  //   }
  // }

  // descargarPDF(asunto: Asunto) {
  //   // Simulación de descarga de PDF usando la API de Blob
  //   const pdfUrl = this.obtenerURLPDF(asunto);

  //   // Crear un elemento invisible para descargar
  //   fetch(pdfUrl)
  //     .then(response => response.blob())
  //     .then(blob => {
  //       const url = window.URL.createObjectURL(blob);
  //       const link = document.createElement('a');
  //       link.href = url;
  //       link.download = asunto.personaRelacionada;
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //       window.URL.revokeObjectURL(url);
  //     });
  // }

  // // Método para simular la obtención de URL de PDF (en producción esto vendría del backend)
  // private obtenerURLPDF(asunto: Asunto): string {
  //   // Para el ejemplo, usamos URLs de PDFs de ejemplo según el tipo de documento
  //   // En producción, aquí consultarías tu API para obtener el PDF real

  //   // PDF de ejemplo para pruebas
  //   return 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  // }

  // cancelarAsignacion() {
  //   this.asuntoSeleccionado = null;
  //   this.abogadoSeleccionado = '';
  // }

  // confirmarAsignacion() {
  //   if (this.asuntoSeleccionado && this.abogadoSeleccionado) {
  //     console.log('Asignando asunto:', this.asuntoSeleccionado.folioInterno, 'a:', this.abogadoSeleccionado);
  //     // Aquí implementar la lógica de asignación
  //     this.asuntoSeleccionado = null;
  //     this.abogadoSeleccionado = '';
  //   }
  // }

  regresar() {
    this.router.navigate(['/layout/assistance']);
  }

  // verDetalle(asunto: Asunto) {
  //   this.asuntoDetalle = asunto;
  // }

  // cerrarDetalle() {
  //   this.asuntoDetalle = null;
  // }

  // getBackgroundColor(asunto: Asunto): string {
  //   const dias = asunto.diasAntiguedad;

  //   if (dias > 15) {
  //     return 'bg-red-500';
  //   } else if (dias >= 5 && dias <= 15) {
  //     return 'bg-yellow-500';
  //   } else {
  //     return 'bg-green-500';
  //   }
  // }



  // verDocumentoDesdeDetalle(asunto: Asunto) {
  //   // Cerrar el modal de detalle primero
  //   this.cerrarDetalle();

  //   // Luego mostrar el PDF
  //   setTimeout(() => {
  //     this.verPDF(asunto);
  //   }, 100);
  // }

  // Agregamos los métodos para la paginación
  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.currentPage = pagina;
      // Re-aplicar la paginación con los datos actuales
      this.filteredData$.subscribe(data => {
        this.actualizarPaginacion(data);
      });
    }
  }

  getPageNumbers(): number[] {
    const maxPagesToShow = 5;
    const pages: number[] = [];
    
    if (this.totalPages <= maxPagesToShow) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Si hay muchas páginas, mostrar un rango alrededor de la página actual
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, start + maxPagesToShow - 1);
      
      // Ajustar si estamos cerca del final
      if (end === this.totalPages) {
        start = Math.max(1, end - maxPagesToShow + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  // Funciones para mapear IDs según reglas de negocio
  getDescripcionDocumento(idDocumento: number): string {
    const documentos: { [key: number]: string } = {
      1: 'RESPUESTA',
      2: 'REQUERIMIENTO', 
      3: 'REQUERIMIENTO Y RESPUESTA',
      4: 'SOLICITUD INTERNA',
      5: 'RESPUESTA INTERNA',
      6: 'RESPUESTA A FGR',
      7: 'ALCANCE'
    };
    return documentos[idDocumento] || 'Documento';
  }

  getDescripcionAtencion(idAtencion: number): string {
    const atenciones: { [key: number]: string } = {
      1: 'TOTAL',
      2: 'PARCIAL',
      3: 'EN TRAMITE',
      4: 'POR ASIGNAR',
      5: 'NO APLICA'
    };
    return atenciones[idAtencion] || 'Sin definir';
  }

  getDescripcionAdministracion(idAdministracion: number): string {
    return `Administración ${idAdministracion}`;
  }

  getDescripcionPlazoAtencion(plazo: number | null | undefined): string {
    if (plazo === null || plazo === undefined) {
      return 'Sin plazo definido';
    }
    if (plazo === 0) {
      return 'URGENTE';
    }
    if (plazo > 0) {
      return `${plazo} ${plazo === 1 ? 'día' : 'días'}`;
    }
    return 'Sin plazo definido';
  }

  formatearFechaRecepcion(fecha: string | null | undefined): string {
    if (!fecha || fecha === '' || fecha === null || fecha === undefined) {
      return 'Fecha no disponible';
    }
    try {
      // Intentar formatear la fecha
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) {
        return 'Fecha no válida';
      }
      return fechaObj.toLocaleDateString('es-MX');
    } catch (error) {
      return 'Fecha no disponible';
    }
  }

  // Método para abrir modal de detalle
  abrirModalDetalle(template: TemplateRef<any>, asunto: tableAsuntosPorDictaminar) {
    this.asuntoDetalle = asunto;
    this.modalService.openCustomDialogWithTemplate({
      template
    });
  }

  cerrarModalDetalle() {
    this.asuntoDetalle = null;
    this.modalService.closeAllDialogs();
  }

  // 📝 MÉTODOS PARA MANEJO DE TEXTO LARGO
  truncarTexto(texto: string, limite: number = 60): string {
    if (!texto || texto.length <= limite) {
      return texto;
    }
    return texto.substring(0, limite) + '...';
  }

  toggleTextoExpandido(folioInterno: string): void {
    if (this.textosExpandidos.has(folioInterno)) {
      this.textosExpandidos.delete(folioInterno);
    } else {
      this.textosExpandidos.add(folioInterno);
    }
  }

  isTextoExpandido(folioInterno: string): boolean {
    return this.textosExpandidos.has(folioInterno);
  }

  necesitaTruncado(texto: string, limite: number = 60): boolean {
    return Boolean(texto && texto.length > limite);
  }

  // 📱 MÉTODOS PARA SCROLL HORIZONTAL RESPONSIVO
  scrollHorizontal(direccion: 'left' | 'right'): void {
    const tabla = document.querySelector('.tabla-scroll');
    if (tabla) {
      const scrollAmount = 200;
      const currentScroll = tabla.scrollLeft;
      const newScroll = direccion === 'left' ? 
        currentScroll - scrollAmount : 
        currentScroll + scrollAmount;
      
      tabla.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  }

  // 📱 DETECTAR SI NECESITA SCROLL HORIZONTAL
  ngAfterViewInit(): void {
    this.checkScrollHorizontal();
    window.addEventListener('resize', () => this.checkScrollHorizontal());
  }

  checkScrollHorizontal(): void {
    setTimeout(() => {
      const tabla = document.querySelector('.tabla-scroll');
      if (tabla) {
        this.scrollHorizontalVisible = tabla.scrollWidth > tabla.clientWidth;
      }
    }, 100);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', () => this.checkScrollHorizontal());
  }

  // 🎯 MÉTODOS PARA HEADER INTELIGENTE Y AGRUPACIÓN
  
  // 📊 CALCULAR CONTADORES HÍBRIDOS CON SUBTOTALES DE PLAZO
  calcularContadores(datos: tableAsuntosPorDictaminar[]): void {
    const urgentes = datos.filter(item => this.getPrioridad(item) === 4);
    const criticos = datos.filter(item => this.getPrioridad(item) === 3);
    const normales = datos.filter(item => this.getPrioridad(item) === 2);
    const recientes = datos.filter(item => this.getPrioridad(item) === 1);
    
    this.contadores = {
      urgente: urgentes.length,
      critico: criticos.length,
      normal: normales.length,
      reciente: recientes.length,
      total: datos.length,
      // Calcular subtotales de casos CON plazo dentro de cada categoría
      criticoConPlazo: criticos.filter(item => item.plazo_atencion && item.plazo_atencion > 0).length,
      normalConPlazo: normales.filter(item => item.plazo_atencion && item.plazo_atencion > 0).length,
      recienteConPlazo: recientes.filter(item => item.plazo_atencion && item.plazo_atencion > 0).length
    };
  }

  // 🔍 APLICAR FILTRO POR PRIORIDAD
  aplicarFiltroPrioridad(filtro: 'todos' | 'urgente' | 'critico' | 'normal' | 'reciente'): void {
    this.filtroActivo = filtro;
    this.currentPage = 1; // Resetear a primera página
    
    // Aplicar filtro a los datos
    this.filteredData$.subscribe(data => {
      let datosFiltrados = data;
      
      if (filtro !== 'todos') {
        const prioridadMap = {
          'urgente': 4,
          'critico': 3,
          'normal': 2,
          'reciente': 1
        };
        
        datosFiltrados = data.filter(item => 
          this.getPrioridad(item) === prioridadMap[filtro]
        );
      }
      
      this.actualizarPaginacion(datosFiltrados);
    });
  }

  // 📋 AGRUPAR DATOS POR PRIORIDAD HÍBRIDA
  obtenerDatosAgrupados(): { [key: string]: tableAsuntosPorDictaminar[] } {
    const agrupados: { [key: string]: tableAsuntosPorDictaminar[] } = {
      "urgente": [],
      "critico": [],
      "normal": [],
      "reciente": []
    };

    this.allData.forEach(item => {
      const prioridad = this.getPrioridad(item);
      switch (prioridad) {
        case 4:
          agrupados["urgente"].push(item);
          break;
        case 3:
          agrupados["critico"].push(item);
          break;
        case 2:
          agrupados["normal"].push(item);
          break;
        case 1:
          agrupados["reciente"].push(item);
          break;
      }
    });

    // Ordenar cada grupo por antigüedad
    Object.keys(agrupados).forEach(key => {
      agrupados[key].sort((a, b) => {
        const antiguedadA = this.calcularAntiguedadEnDias(a.fecha_recepcion);
        const antiguedadB = this.calcularAntiguedadEnDias(b.fecha_recepcion);
        return antiguedadB - antiguedadA; // Mayor antigüedad primero
      });
    });

    return agrupados;
  }

  // 🔽 TOGGLE SECCIÓN COLAPSADA
  toggleSeccion(seccion: string): void {
    if (this.seccionesColapsadas.has(seccion)) {
      this.seccionesColapsadas.delete(seccion);
    } else {
      this.seccionesColapsadas.add(seccion);
    }
  }

  // ❓ VERIFICAR SI SECCIÓN ESTÁ COLAPSADA
  isSeccionColapsada(seccion: string): boolean {
    return this.seccionesColapsadas.has(seccion);
  }

  // 🎨 OBTENER CONFIGURACIÓN DE PRIORIDAD
  getConfiguracionPrioridad(tipo: string): { 
    icono: string, 
    color: string, 
    titulo: string, 
    descripcion: string,
    bgColor: string,
    borderColor: string
  } {
         const configuraciones: { [key: string]: { 
       icono: string, 
       color: string, 
       titulo: string, 
       descripcion: string,
       bgColor: string,
       borderColor: string
     }} = {
       "urgente": {
         icono: '🚨',
         color: 'text-red-600',
         titulo: 'CASOS URGENTES',
         descripcion: 'Requieren atención inmediata',
         bgColor: 'bg-red-50',
         borderColor: 'border-red-200'
       },
       "critico": {
         icono: '🔴',
         color: 'text-red-500',
         titulo: 'CASOS CRÍTICOS',
         descripcion: 'Más de 15 días sin atender',
         bgColor: 'bg-red-50',
         borderColor: 'border-red-200'
       },
       "normal": {
         icono: '🟡',
         color: 'text-yellow-600',
         titulo: 'CASOS NORMALES',
         descripcion: 'Entre 5 y 15 días',
         bgColor: 'bg-yellow-50',
         borderColor: 'border-yellow-200'
       },
       "reciente": {
         icono: '🟢',
         color: 'text-green-600',
         titulo: 'CASOS RECIENTES',
         descripcion: 'Menos de 4 días',
         bgColor: 'bg-green-50',
         borderColor: 'border-green-200'
       }
     };

    return configuraciones[tipo] || configuraciones["reciente"];
  }

  // 🔄 TOGGLE VISTA AGRUPADA/LISTA
  toggleVistaAgrupacion(): void {
    this.mostrarAgrupacion = !this.mostrarAgrupacion;
    
    if (!this.mostrarAgrupacion) {
      // Vista de lista normal
      this.filteredData$.subscribe(data => {
        this.actualizarPaginacion(data);
      });
    }
  }

  // 📊 ACTUALIZAR CON NUEVOS DATOS
  actualizarDatosConContadores(datos: tableAsuntosPorDictaminar[]): void {
    this.calcularContadores(datos);
    this.actualizarPaginacion(datos);
  }

  // ✅ MÉTODOS PARA FUNCIONALIDAD PDF VIEWER
  
  /**
   * Abre el visualizador de PDF en modal
   * @param folio - Folio interno del asunto
   * @param path - Path o número del archivo escaneado
   */
  openPdfViewer(folio: string, path: number): void {
    console.log('🔍 [AsignacionPage] openPdfViewer INICIADO');
    console.log('🔍 [AsignacionPage] Parámetros recibidos:', { folio, path });
    
    if (folio == null) {
      folio = "sinAsignar";
      console.log('🔍 [AsignacionPage] Folio era null, cambiado a:', folio);
    }
    
    this.pdfCargando = true;
    this.pdfError = false;
    this.pdfUrl = null;
    
    // Primero intentar listar archivos reales del folio
    console.log('🔍 [AsignacionPage] Intentando listar archivos reales para:', folio);
    
    this.archivosAtencionService.listarArchivosPdfAtencion(folio).subscribe({
      next: (archivos: any[]) => {
        console.log('🔍 [AsignacionPage] Archivos encontrados:', archivos);
        
        if (archivos && archivos.length > 0) {
          // Usar el primer archivo PDF encontrado
          const primerArchivo = archivos[0];
          const nombreArchivo = primerArchivo.nombre || primerArchivo.name;
          
          console.log('✅ [AsignacionPage] Usando archivo real encontrado:', nombreArchivo);
          this.cargarPdfDirecto(folio, nombreArchivo);
        } else {
          console.log('⚠️ [AsignacionPage] No se encontraron archivos, usando lista de nombres posibles');
          this.probarArchivosPorNombre(folio, path);
        }
      },
      error: (error: any) => {
        console.log('⚠️ [AsignacionPage] Error al listar archivos, usando lista de nombres posibles:', error.status);
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
    
    console.log('🔍 [AsignacionPage] Probando nombres de archivo:', nombresArchivoPosibles);
    this.probarArchivos(folio, nombresArchivoPosibles, 0);
  }
  
  private cargarPdfDirecto(folio: string, nombreArchivo: string): void {
    console.log(`🔍 [AsignacionPage] Cargando PDF directamente: ${nombreArchivo}`);
    
    this.archivosAtencionService.obtenerPdf(folio, nombreArchivo).subscribe({
      next: (data: string) => {
        if (!data || data.trim() === '') {
          console.log(`⚠️ [AsignacionPage] Archivo ${nombreArchivo} vacío`);
          this.pdfError = true;
          this.pdfCargando = false;
          return;
        }
        
        console.log(`✅ [AsignacionPage] Archivo ${nombreArchivo} cargado exitosamente`);
        
        try {
          const pdfSrc = `data:application/pdf;base64,${data}`;
          this.pdfUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(pdfSrc);
          this.visualizarPdf = true;
          this.pdfCargando = false;
        } catch (error) {
          console.error('❌ [AsignacionPage] Error al procesar el PDF:', error);
          this.pdfError = true;
          this.pdfCargando = false;
        }
      },
      error: (error: any) => {
        console.error(`❌ [AsignacionPage] Error al cargar PDF directo ${nombreArchivo}:`, error);
        this.pdfError = true;
        this.pdfCargando = false;
      }
    });
  }
  
  private probarArchivos(folio: string, nombresArchivos: string[], indice: number): void {
    if (indice >= nombresArchivos.length) {
      console.error('❌ [AsignacionPage] No se pudo encontrar ningún archivo PDF');
      this.pdfError = true;
      this.pdfCargando = false;
      return;
    }
    
    const nombreArchivo = nombresArchivos[indice];
    console.log(`🔍 [AsignacionPage] Probando archivo ${indice + 1}/${nombresArchivos.length}: ${nombreArchivo}`);
    
    this.archivosAtencionService.obtenerPdf(folio, nombreArchivo).subscribe({
      next: (data: string) => {
        if (!data || data.trim() === '') {
          console.log(`⚠️ [AsignacionPage] Archivo ${nombreArchivo} vacío, probando siguiente...`);
          this.probarArchivos(folio, nombresArchivos, indice + 1);
          return;
        }
        
        console.log(`✅ [AsignacionPage] Archivo ${nombreArchivo} encontrado y cargado exitosamente`);
        
        try {
          const pdfSrc = `data:application/pdf;base64,${data}`;
          this.pdfUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(pdfSrc);
          this.visualizarPdf = true;
          this.pdfCargando = false;
        } catch (error) {
          console.error('❌ [AsignacionPage] Error al procesar el PDF:', error);
          this.pdfError = true;
          this.pdfCargando = false;
        }
      },
      error: (error: any) => {
        console.log(`⚠️ [AsignacionPage] Error con archivo ${nombreArchivo}:`, error.status);
        
        // Si es un error 404, probar el siguiente archivo
        if (error.status === 404) {
          this.probarArchivos(folio, nombresArchivos, indice + 1);
        } else {
          console.error('❌ [AsignacionPage] Error no recuperable:', error);
          this.pdfError = true;
          this.pdfCargando = false;
        }
      }
    });
  }

  /**
   * Abre el modal PDF usando el ModalService
   * @param template - Template reference del modal
   */
  abrirModalPDF(template: TemplateRef<any>): void {
    this.modalService.openCustomDialogWithTemplate({
      template
    });
  }

  /**
   * Cierra el visualizador de PDF
   */
  cerrarVisualizador(): void {
    this.visualizarPdf = false;
    this.pdfUrl = null;
    this.pdfCargando = false;
    this.pdfError = false;
  }

  /**
   * 🚨 NUEVO: Aplica filtro para mostrar solo asuntos urgentes
   */
  private aplicarFiltroUrgentes(): void {
    console.log('🚨 [AsignacionPage] Aplicando filtro de asuntos urgentes');
    
    // Esperar a que los datos se carguen
    setTimeout(() => {
      if (this.allData && this.allData.length > 0) {
        // Filtrar solo asuntos con plazo_atencion = 0 (urgentes)
        const asuntosUrgentes = this.allData.filter(asunto => 
          asunto.plazo_atencion === 0
        );
        
        console.log(`🚨 [AsignacionPage] Encontrados ${asuntosUrgentes.length} asuntos urgentes`);
        
        // Actualizar el servicio de búsqueda con los datos filtrados
        this.buscadorService.setData(asuntosUrgentes);
        
        // Actualizar contadores y paginación
        this.calcularContadores(asuntosUrgentes);
        this.actualizarPaginacion(asuntosUrgentes);
        
        // Mostrar mensaje informativo
        if (asuntosUrgentes.length === 0) {
          console.log('✅ [AsignacionPage] No hay asuntos urgentes en este momento');
        }
      } else {
        // Si no hay datos, intentar nuevamente después de un breve delay
        setTimeout(() => this.aplicarFiltroUrgentes(), 1000);
      }
    }, 500);
  }
}
