import { AsignarAsunto, AsignarAsuntoRequest, modalItem } from './../../../interfaces/asiganar-AsuntoRequest.interface';
import { Component, OnInit, TemplateRef } from '@angular/core';
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
export class AsignacionPageComponent implements OnInit {
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
    // Guardar el total de registros
    this.totalRegistros = datos.length;
    
    // Calcular total de páginas
    this.totalPages = Math.ceil(datos.length / this.itemsPerPage);
    
    // Resetear a la primera página si la página actual es mayor que el total
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
    
    // Calcular índices
    const inicio = (this.currentPage - 1) * this.itemsPerPage;
    const fin = inicio + this.itemsPerPage;
    
    // Actualizar los asuntos paginados
    this.asuntosPaginados = datos.slice(inicio, fin);
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
    return this.tablePorAsignarIndicador.filter(asunto =>
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

  get asuntosOrdenados() {
    // Primero ordenamos todos los asuntos filtrados
    const allOrdered = this.asuntosFiltrados.sort((a, b) => {
      // Primero ordenar por prioridad (rojo > amarillo > verde)
      const prioridadA = this.getPrioridad(a.plazo_atencion);
      const prioridadB = this.getPrioridad(b.plazo_atencion);

      if (prioridadA !== prioridadB) {
        return prioridadB - prioridadA;
      }

      // Si tienen la misma prioridad, ordenar por días de antigüedad
      return b.plazo_atencion - a.plazo_atencion;
    });

    // Luego tomamos solo los que corresponden a la página actual
    return allOrdered.slice(this.startIndex, this.endIndex);
  }


  getPrioridad(dias: number): number {
    if (dias > 15 )  return 3; // Rojo
    if (dias >= 5 && dias <= 15) return 2; // Amarillo
    return 1; // Verde
  }

  getColorSemaforo(asunto:tableAsuntosPorDictaminar ): string {
    const dias = asunto.plazo_atencion;
    if (dias > 15) {
      return 'bg-red-500';
    } else if (dias >= 5 && dias <= 15) {
      return 'bg-yellow-500';
    } else {
      return 'bg-green-500';
    }
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
}
