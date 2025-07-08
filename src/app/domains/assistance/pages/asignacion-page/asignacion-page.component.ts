import { AsignarAsunto, AsignarAsuntoRequest, modalItem } from './../../../interfaces/asiganar-AsuntoRequest.interface';
import { Component, OnInit, TemplateRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule} from '@angular/material/dialog';
import { FormControl, FormsModule,  ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import {  porAsignarRequest, tableAsuntosPorDictaminar } from '../../../interfaces/porAsignarRequest.interface';
import { CardsInfoBandejadeAtencionService } from '../../../services/cards-info-bandejade-atencion.service';
import { usuariosPorAdministracion } from '../../../interfaces/usuarios-Por-administracion.interface';
import { ModalService } from '../../../shared/services/modal.service';
import { BuscadorService } from '../../../shared/services/buscador.service';
import { Observable,of } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-asignacion-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    PdfViewerModule,
    ReactiveFormsModule,
    NgxPaginationModule
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
  // mostrarPDFViewer: boolean = false;
  // pdfSrc: string = '';
  // pdfTitulo: string = '';
  // asuntoParaDescargar: Asunto | null = null;

  asignadosTable: boolean = false
  documento: string = 'REQUERIMIENTO'
  usuariosAsignar: usuariosPorAdministracion[] = []
   itemDeFilaSelecionada: modalItem | null = null

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

  // 📱 Variables para manejo de texto largo y responsividad
  textosExpandidos: Set<string> = new Set();
  scrollHorizontalVisible: boolean = false;

  constructor(private router: Router,
    private cards: CardsInfoBandejadeAtencionService,
    private modalService: ModalService,
   private buscadorService:BuscadorService<tableAsuntosPorDictaminar>) { }

  ngOnInit() {
    this.filteredData$ = this.buscadorService.getFilteredData(this.filtrarIndicador);
    this.tablePorAsignar();
    
    // Suscribirse a los cambios en los datos filtrados para actualizar la paginación
    this.filteredData$.subscribe(data => {
      this.actualizarPaginacion(data);
    });
  }

  actualizarPaginacion(datos: tableAsuntosPorDictaminar[]) {
    // 📊 APLICAR ORDENAMIENTO POR PRIORIDADES ANTES DE PAGINAR
    const datosOrdenados = datos.sort((a, b) => {
      // Obtener prioridades usando el sistema de prioridades
      const prioridadA = this.getPrioridad(a);
      const prioridadB = this.getPrioridad(b);

      // Primero ordenar por prioridad (4=urgente, 3=rojo, 2=amarillo, 1=verde)
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

  abrirModalAsignacion(template: TemplateRef<any>, item: modalItem) {
    this.itemDeFilaSelecionada = item
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

  // 🎯 SISTEMA DE PRIORIDADES CORREGIDO CON ANTIGÜEDAD REAL
  getPrioridad(asunto: tableAsuntosPorDictaminar): number {
    // 🔴 MÁXIMA PRIORIDAD: Plazo de atención = 0 (URGENTE)
    if (asunto.plazo_atencion === 0) {
      return 4; // Prioridad máxima
    }
    
    // Calcular antigüedad real desde fecha de recepción
    const antiguedadDias = this.calcularAntiguedadEnDias(asunto.fecha_recepcion);
    
    // 🔴 ALTA PRIORIDAD: Mayor a 15 días de antigüedad real
    if (antiguedadDias > 15) {
      return 3; // Rojo por antigüedad
    }
    
    // 🟡 MEDIA PRIORIDAD: Entre 5 y 15 días de antigüedad real
    if (antiguedadDias >= 5 && antiguedadDias <= 15) {
      return 2; // Amarillo
    }
    
    // 🟢 BAJA PRIORIDAD: Menor a 4 días de antigüedad real
    return 1; // Verde
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

  // 🏷️ BADGES DE PRIORIDAD CORREGIDOS
  getBadgePrioridad(asunto: tableAsuntosPorDictaminar): { clase: string, texto: string } {
    if (asunto.plazo_atencion === 0) {
      return { 
        clase: 'bg-red-100 text-red-800 animate-pulse border border-red-300', 
        texto: '🚨 URGENTE' 
      };
    }
    
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
}
