import { Observable, of } from 'rxjs';
import { AsuntoPorAtencionParcialRequest } from './../../../interfaces/asuntoPorAtencion.interface';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AsuntoPorAsigacionResponseEnTramite, AsuntoPorAsigacionResponseParcial } from '../../../interfaces/asuntoPorAtencionResponse.interface';
import { CardsInfoBandejadeAtencionService } from '../../../services/cards-info-bandejade-atencion.service';
import { BuscadorService } from '../../../shared/services/buscador.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ArchivosAtencionService } from '../../../services/archivos-atencion.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'app-parcial-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgxPaginationModule, MatIconModule, MatButtonModule],
  templateUrl: './parcial-detalle.component.html',
  styleUrls: ['./parcial-detalle.component.css']
})
export class ParcialDetalleComponent implements OnInit {

  paginaActual: number = 1;
  itemsPorPagina: number = 8;
  totalAsuntos: number = 20;

  tableparcialRequest: AsuntoPorAtencionParcialRequest = {
    atencion: "PARCIAL",
    documento: "REQUERIMIENTO",
  }
  tableParcialResponse: AsuntoPorAsigacionResponseParcial[] = [];

  //#region paginador
  pages: AsuntoPorAsigacionResponseParcial[][] = []
  itemsPerPage: number = 5
  pageSelected: number = 1;
  labelsPaginator = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
  };
  //#endregion

  constructor(private router: Router,
    private cards: CardsInfoBandejadeAtencionService,
    private buscadorService: BuscadorService<AsuntoPorAsigacionResponseParcial>,
    private archivosAtencionService: ArchivosAtencionService,
    private domSanitizer: DomSanitizer,
    private modalService: ModalService) { }

  ngOnInit(): void {
    this.tablePracial()
  }

  onDearchChange(value: string) {
    this.buscadorService.setSearchTerm(value)
  }

  // filtrarIndicador = (item: AsuntoPorAsigacionResponseParcial, term: string): boolean => {
  //   return item.folio_interno?.toLowerCase().includes(term.toLocaleLowerCase());
  // };


  // asignarIndicador: Observable<AsuntoPorAsigacionResponseParcial[]> = new Observable

  // searchText: string = '';
  // filteredData$: Observable<AsuntoPorAsigacionResponseParcial[]> = this.buscadorService.getFilteredData(this.filtrarIndicador);

onSearchChange() {
  this.updateSearch();
}
  searchTextNoOficio:string="";
  searchPersona_relacionada:string='';
  searchAutoridad_remitente:string='';
  searchfolio_interno:string='';
  searchcarpeta_investigacion:string='';

updateSearch() {
  this.buscadorService.setSearchTermsMu({
    folio: this.searchfolio_interno,
    carpeta: this.searchcarpeta_investigacion,
    persona : this.searchPersona_relacionada,
    oficio: this.searchTextNoOficio,
    autoridad_remitente: this.searchAutoridad_remitente,
  });
}


 filterIndicador = (item: AsuntoPorAsigacionResponseParcial, terms: Record<string, string>): boolean => {
  debugger
const matchOficio = !terms['oficio'] || item.oficio?.toLowerCase().includes(terms['oficio'].toLowerCase());
const matchCarpeta = !terms['carpeta'] || item.carpeta_investigacion?.toLowerCase().includes(terms['carpeta'].toLowerCase())
const matchFolio = !terms['autoridad_remitente'] || item.autoridad_remitente?.toLowerCase().includes(terms['autoridad_remitente'].toLowerCase());
const matchfolio_interno = !terms['folio'] || item.folio_interno?.toLowerCase().includes(terms['folio'].toLowerCase());
const matchPersona = !terms['persona'] || item.persona_relacionada?.toLowerCase().includes(terms['persona'].toLowerCase())

return matchFolio && matchOficio && matchPersona && matchfolio_interno && matchCarpeta;
}


  filteredDataMul$: Observable<AsuntoPorAsigacionResponseParcial[]> = this.buscadorService.getFilteredDataMul(this.filterIndicador) ;


  allData: AsuntoPorAsigacionResponseParcial[] = [];

  // ✅ Variables para funcionalidad PDF Viewer
  visualizarPdf: boolean = false;
  pdfUrl: SafeResourceUrl | null = null;
  pdfCargando: boolean = false;
  pdfError: boolean = false;

  tablePracial() {
    this.cards.parcialTableCard(this.tableparcialRequest).subscribe(res => {
      // this.tableParcialResponse=res
      this.allData = res;
      this.buscadorService.setDataMul(this.allData)
          this.updateSearch();

             let indexPage = 0;
              let page: AsuntoPorAsigacionResponseParcial[] = [];
              this.pages = []
              this.pageSelected = 1;
              this.allData.forEach((doc) => {
                page.push(doc);
                indexPage += 1;
                if (indexPage === this.itemsPerPage) {
                  this.pages.push(page);
                  indexPage = 0
                  page = []
                }
              })
              if (page.length !== 0) this.pages.push(page)
    })
  }

  volver(): void {
    this.router.navigate(['/layout/assistance']);
  }

  // Métodos para descargar Excel
  descargarExcel() {
    this.cards.descargarExcelParcial(this.tableparcialRequest)
  }

  // ✅ MÉTODOS PARA FUNCIONALIDAD PDF VIEWER

  /**
   * Abre el visualizador de PDF en modal
   * @param folio - Folio interno del asunto
   * @param path - Path o número del archivo escaneado
   */
  openPdfViewer(folio: string, path: number): void {
    console.log('🔍 [ParcialDetalle] openPdfViewer INICIADO');
    console.log('🔍 [ParcialDetalle] Parámetros recibidos:', { folio, path });

    if (folio == null) {
      folio = "sinAsignar";
      console.log('🔍 [ParcialDetalle] Folio era null, cambiado a:', folio);
    }

    this.pdfCargando = true;
    this.pdfError = false;
    this.pdfUrl = null;

    // Primero intentar listar archivos reales del folio
    console.log('🔍 [ParcialDetalle] Intentando listar archivos reales para:', folio);

    this.archivosAtencionService.listarArchivosPdfAtencion(folio).subscribe({
      next: (archivos: any[]) => {
        console.log('🔍 [ParcialDetalle] Archivos encontrados:', archivos);

        if (archivos && archivos.length > 0) {
          // Usar el primer archivo PDF encontrado
          const primerArchivo = archivos[0];
          const nombreArchivo = primerArchivo.nombre || primerArchivo.name;

          console.log('✅ [ParcialDetalle] Usando archivo real encontrado:', nombreArchivo);
          this.cargarPdfDirecto(folio, nombreArchivo);
        } else {
          console.log('⚠️ [ParcialDetalle] No se encontraron archivos, usando lista de nombres posibles');
          this.probarArchivosPorNombre(folio, path);
        }
      },
      error: (error: any) => {
        console.log('⚠️ [ParcialDetalle] Error al listar archivos, usando lista de nombres posibles:', error.status);
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

    console.log('🔍 [ParcialDetalle] Probando nombres de archivo:', nombresArchivoPosibles);
    this.probarArchivos(folio, nombresArchivoPosibles, 0);
  }

  private cargarPdfDirecto(folio: string, nombreArchivo: string): void {
    console.log(`🔍 [ParcialDetalle] Cargando PDF directamente: ${nombreArchivo}`);

    this.archivosAtencionService.obtenerPdf(folio, nombreArchivo).subscribe({
      next: (data: string) => {
        if (!data || data.trim() === '') {
          console.log(`⚠️ [ParcialDetalle] Archivo ${nombreArchivo} vacío`);
          this.pdfError = true;
          this.pdfCargando = false;
          return;
        }

        console.log(`✅ [ParcialDetalle] Archivo ${nombreArchivo} cargado exitosamente`);

        try {
          const pdfSrc = `data:application/pdf;base64,${data}`;
          this.pdfUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(pdfSrc);
          this.visualizarPdf = true;
          this.pdfCargando = false;
        } catch (error) {
          console.error('❌ [ParcialDetalle] Error al procesar el PDF:', error);
          this.pdfError = true;
          this.pdfCargando = false;
        }
      },
      error: (error: any) => {
        console.error(`❌ [ParcialDetalle] Error al cargar PDF directo ${nombreArchivo}:`, error);
        this.pdfError = true;
        this.pdfCargando = false;
      }
    });
  }

  private probarArchivos(folio: string, nombresArchivos: string[], indice: number): void {
    if (indice >= nombresArchivos.length) {
      console.error('❌ [ParcialDetalle] No se pudo encontrar ningún archivo PDF');
      this.pdfError = true;
      this.pdfCargando = false;
      return;
    }

    const nombreArchivo = nombresArchivos[indice];
    console.log(`🔍 [ParcialDetalle] Probando archivo ${indice + 1}/${nombresArchivos.length}: ${nombreArchivo}`);

    this.archivosAtencionService.obtenerPdf(folio, nombreArchivo).subscribe({
      next: (data: string) => {
        if (!data || data.trim() === '') {
          console.log(`⚠️ [ParcialDetalle] Archivo ${nombreArchivo} vacío, probando siguiente...`);
          this.probarArchivos(folio, nombresArchivos, indice + 1);
          return;
        }

        console.log(`✅ [ParcialDetalle] Archivo ${nombreArchivo} encontrado y cargado exitosamente`);

        try {
          const pdfSrc = `data:application/pdf;base64,${data}`;
          this.pdfUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(pdfSrc);
          this.visualizarPdf = true;
          this.pdfCargando = false;
        } catch (error) {
          console.error('❌ [ParcialDetalle] Error al procesar el PDF:', error);
          this.pdfError = true;
          this.pdfCargando = false;
        }
      },
      error: (error: any) => {
        console.log(`⚠️ [ParcialDetalle] Error con archivo ${nombreArchivo}:`, error.status);

        // Si es un error 404, probar el siguiente archivo
        if (error.status === 404) {
          this.probarArchivos(folio, nombresArchivos, indice + 1);
        } else {
          console.error('❌ [ParcialDetalle] Error no recuperable:', error);
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
    this.modalService.closeAllDialogs();
  }
}
