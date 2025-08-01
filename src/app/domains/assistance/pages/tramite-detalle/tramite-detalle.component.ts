import { AsuntoPorAsigacionResponseEnTramite } from './../../../interfaces/asuntoPorAtencionResponse.interface';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardsInfoBandejadeAtencionService } from '../../../services/cards-info-bandejade-atencion.service';
import { AsuntoPorAtencionEnTramiteRequest } from '../../../interfaces/asuntoPorAtencion.interface';
import { BuscadorService } from '../../../shared/services/buscador.service';
import { Observable, of } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { PdfViewerComponent } from '../../../components/pdf-viewer/pdf-viewer.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ArchivosAtencionService } from '../../../services/archivos-atencion.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tramite-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgxPaginationModule, PdfViewerComponent, MatIconModule],
  templateUrl: './tramite-detalle.component.html',
  styleUrls: ['./tramite-detalle.component.css']
})
export class TramiteDetalleComponent implements OnInit {

  //#region paginador
   pages: AsuntoPorAsigacionResponseEnTramite[][] = []
  itemsPerPage: number = 5;
  pageSelected: number = 1;
  labelsPaginator = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
  };
  //#endregion

  tableRequest: AsuntoPorAtencionEnTramiteRequest={
    atencion:"EN TRAMITE",
    documento:"REQUERIMIENTO",
  }
  tableResponse: AsuntoPorAsigacionResponseEnTramite[]=[];

  // ✅ Variables para funcionalidad PDF Viewer
  visualizarPdf: boolean = false;
  pdfUrl: SafeResourceUrl | null = null;
  pdfCargando: boolean = false;
  pdfError: boolean = false;

  constructor(private router: Router,
     private cards:CardsInfoBandejadeAtencionService,
    private buscadorService: BuscadorService<AsuntoPorAsigacionResponseEnTramite>,
    private domSanitizer: DomSanitizer,
    private archivosAtencionService: ArchivosAtencionService
   ) {}

  ngOnInit(): void {
     this.tableEnTramite()
     }

  tableEnTramite(){
  this.cards.enTramiteTableCard(this.tableRequest).subscribe(res=>{
    // this.tableResponse = res;
    this.allData=res;
    this.buscadorService.setDataMul(this.allData);
    this.updateSearch();

       let indexPage = 0;
        let page: AsuntoPorAsigacionResponseEnTramite[] = [];
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
//#region  buscador

  onDearchChange(value:string){
    this.buscadorService.setSearchTerm(value)
  }

  //para un solo filtro
  // filterIndicador=(item:AsuntoPorAsigacionResponseEnTramite, term:string):boolean=>{
  //   return item.folio_interno?.toLocaleLowerCase().includes(term.toLocaleLowerCase())
  // }

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

 filterIndicador = (item: AsuntoPorAsigacionResponseEnTramite, terms: Record<string, string>): boolean => {
const matchOficio = !terms['oficio'] || item.oficio?.toLowerCase().includes(terms['oficio'].toLowerCase());
const matchCarpeta = !terms['carpeta'] || item.carpeta_investigacion?.toLowerCase().includes(terms['carpeta'].toLowerCase())
const matchFolio = !terms['autoridad_remitente'] || item.autoridad_remitente?.toLowerCase().includes(terms['autoridad_remitente'].toLowerCase());
const matchfolio_interno = !terms['folio'] || item.folio_interno?.toLowerCase().includes(terms['folio'].toLowerCase());
const matchPersona = !terms['persona'] || item.persona_relacionada?.toLowerCase().includes(terms['persona'].toLowerCase())

return matchFolio && matchOficio && matchPersona && matchfolio_interno && matchCarpeta;
};




  // asignarIndicador : Observable<AsuntoPorAsigacionResponseEnTramite[]>= new Observable;


  // result$: Observable<string[]> = of ([]);
// para un solo filtro
 //filteredData$: Observable<AsuntoPorAsigacionResponseEnTramite[]> = this.buscadorService.getFilteredData(this.filterIndicador) ;

  filteredDataMul$: Observable<AsuntoPorAsigacionResponseEnTramite[]> = this.buscadorService.getFilteredDataMul(this.filterIndicador) ;


  //#endregion
  allData: AsuntoPorAsigacionResponseEnTramite[]=[]

  // Navegación
  volver(): void {
    this.router.navigate(['/layout/assistance']);
  }

  // Exportar a Excel
  descargarExcel(): void {
    this.cards.descargarExcelEnTramite(this.tableRequest)
  }

  // ✅ MÉTODOS PARA FUNCIONALIDAD PDF VIEWER

  /**
   * Abre el visualizador de PDF en modal (basado en la lógica de asignación)
   * @param folio - Folio interno del asunto
   * @param path - Path o número del archivo escaneado
   */
  openPdfViewer(folio: string, path: number): void {
    console.log('🔍 [TramiteDetalle] openPdfViewer INICIADO');
    console.log('🔍 [TramiteDetalle] Parámetros recibidos:', { folio, path });

    if (folio == null) {
      folio = "sinAsignar";
      console.log('🔍 [TramiteDetalle] Folio era null, cambiado a:', folio);
    }

    this.pdfCargando = true;
    this.pdfError = false;
    this.pdfUrl = null;

    // Primero intentar listar archivos reales del folio
    console.log('🔍 [TramiteDetalle] Intentando listar archivos reales para:', folio);

    this.archivosAtencionService.listarArchivosPdfAtencion(folio).subscribe({
      next: (archivos: any[]) => {
        console.log('🔍 [TramiteDetalle] Archivos encontrados:', archivos);

        if (archivos && archivos.length > 0) {
          // Usar el primer archivo PDF encontrado
          const primerArchivo = archivos[0];
          const nombreArchivo = primerArchivo.nombre || primerArchivo.name;

          console.log('✅ [TramiteDetalle] Usando archivo real encontrado:', nombreArchivo);
          this.cargarPdfDirecto(folio, nombreArchivo);
        } else {
          console.log('⚠️ [TramiteDetalle] No se encontraron archivos, usando lista de nombres posibles');
          this.probarArchivosPorNombre(folio, path);
        }
      },
      error: (error: any) => {
        console.log('⚠️ [TramiteDetalle] Error al listar archivos, usando lista de nombres posibles:', error.status);
        this.probarArchivosPorNombre(folio, path);
      }
    });
  }

  private probarArchivosPorNombre(folio: string, path: number): void {
    const nombresArchivos = [
      `${path}.pdf`,
      `${folio.replace(/\//g, '_')}.pdf`,
      `${folio}.pdf`,
      'documento.pdf',
      'archivo.pdf'
    ];

    console.log('🔍 [TramiteDetalle] Probando archivos por nombre:', nombresArchivos);
    this.probarArchivos(folio, nombresArchivos, 0);
  }

  private cargarPdfDirecto(folio: string, nombreArchivo: string): void {
    console.log(`🔍 [TramiteDetalle] Cargando PDF directamente: ${nombreArchivo}`);

    this.archivosAtencionService.obtenerPdf(folio, nombreArchivo).subscribe({
      next: (data: string) => {
        if (!data || data.trim() === '') {
          console.log(`⚠️ [TramiteDetalle] Archivo ${nombreArchivo} vacío`);
          this.pdfError = true;
          this.pdfCargando = false;
          return;
        }

        console.log(`✅ [TramiteDetalle] Archivo ${nombreArchivo} cargado exitosamente`);

        try {
          const pdfSrc = `data:application/pdf;base64,${data}`;
          this.pdfUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(pdfSrc);
          this.visualizarPdf = true;
          this.pdfCargando = false;
        } catch (error) {
          console.error('❌ [TramiteDetalle] Error al procesar el PDF:', error);
          this.pdfError = true;
          this.pdfCargando = false;
        }
      },
      error: (error: any) => {
        console.error(`❌ [TramiteDetalle] Error al cargar PDF directo ${nombreArchivo}:`, error);
        this.pdfError = true;
        this.pdfCargando = false;
      }
    });
  }

  private probarArchivos(folio: string, nombresArchivos: string[], indice: number): void {
    if (indice >= nombresArchivos.length) {
      console.error('❌ [TramiteDetalle] No se pudo encontrar ningún archivo PDF');
      this.pdfError = true;
      this.pdfCargando = false;
      return;
    }

    const nombreArchivo = nombresArchivos[indice];
    console.log(`🔍 [TramiteDetalle] Probando archivo ${indice + 1}/${nombresArchivos.length}: ${nombreArchivo}`);

    this.archivosAtencionService.obtenerPdf(folio, nombreArchivo).subscribe({
      next: (data: string) => {
        if (!data || data.trim() === '') {
          console.log(`⚠️ [TramiteDetalle] Archivo ${nombreArchivo} vacío, probando siguiente...`);
          this.probarArchivos(folio, nombresArchivos, indice + 1);
          return;
        }

        console.log(`✅ [TramiteDetalle] Archivo ${nombreArchivo} encontrado y cargado exitosamente`);

        try {
          const pdfSrc = `data:application/pdf;base64,${data}`;
          this.pdfUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(pdfSrc);
          this.visualizarPdf = true;
          this.pdfCargando = false;
        } catch (error) {
          console.error('❌ [TramiteDetalle] Error al procesar el PDF:', error);
          this.pdfError = true;
          this.pdfCargando = false;
        }
      },
      error: (error: any) => {
        console.log(`⚠️ [TramiteDetalle] Error con archivo ${nombreArchivo}:`, error.status);

        // Si es un error 404, probar el siguiente archivo
        if (error.status === 404) {
          this.probarArchivos(folio, nombresArchivos, indice + 1);
        } else {
          console.error('❌ [TramiteDetalle] Error no recuperable:', error);
          this.pdfError = true;
          this.pdfCargando = false;
        }
      }
    });
  }

  /**
   * Cierra el visualizador de PDF
   */
  cerrarVisualizadorPdf(): void {
    this.visualizarPdf = false;
    this.pdfUrl = null;
    this.pdfCargando = false;0
    this.pdfError = false;
  }
}
