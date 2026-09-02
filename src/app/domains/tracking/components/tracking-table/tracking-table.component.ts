import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, inject, ViewChild, OnInit } from '@angular/core';
import { AsuntoService } from '../../../services/asunto.service';
import { ExpedienteTlalcalliService } from '../../../../domains/capture/services/expediente-tlalcalli.service';
import { ExpedienteTlalcalli } from '../../../../domains/capture/interfaces/expediente-tlalcalli.interface';
import { Asunto } from '../../../interfaces/asuntos.interfaces';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatIcon } from '@angular/material/icon';
import { NgxPaginationModule } from 'ngx-pagination';
import 'lib-itsi/src/components/button/button.js';
import { CommonModule } from '@angular/common';
import { FileService } from '../../../services/file.service';
import { EditTackingTableComponent } from '../edit-tacking-table/edit-tacking-table.component';
import { PdfViewerComponent } from '../../../components/pdf-viewer/pdf-viewer.component';
import { MsgReaderComponent } from '../../../components/msg-reader/msg-reader.component';
import { SharedDataFormService } from '../../../shared/services/shared-data-form.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExpedienteDetalleModalComponent } from '../expediente-detalle-modal/expediente-detalle-modal.component';

@Component({
    selector: 'app-tracking-table',
    imports: [
        PdfViewerModule,
        MatIcon,
        NgxPaginationModule,
        CommonModule,
        MatDialogModule,
        EditTackingTableComponent,
        PdfViewerComponent,
        MsgReaderComponent,
    ],
    templateUrl: './tracking-table.component.html',
    styleUrl: './tracking-table.component.css',
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})



export class TrackingTableComponent implements OnInit {
  public documents: Asunto[] = [];
  public pages: Asunto[][] = [];

  public description: Asunto[] = []

  public pageSelected = 1;

  public itemsPerPage = 20;

  public tipoBusqueda = '';

  public newTableIsRendered = false;

  public pdfIsRendered = false;

  public formUpdateIsRendered = false;

  public fileIsOpen = false;

  public visualizarPdf = false;

  public visualizarMsg = false;

  editar = false

  isExpanded = false;

  index = 0;



  filaSeleccionada: any

  public mostrarTabla = false;

  clickclose = false;

  public labels = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
  };
  @ViewChild("edit-tacking-table") miComponente!: ElementRef;


  folio_interno= ""
  carpeta_investigacion= ""
  oficio= ""
  autoridad_remitente= ""
  persona_relacionada= ""
  volante_jefatura= ""
  turno_jefatura= ""

  // Expedientes Tlalcalli
  public expedientesTlalcalli: ExpedienteTlalcalli[] = [];
  public pagesExpedientes: ExpedienteTlalcalli[][] = [];
  
  constructor(
    private asuntoService: AsuntoService,
    private expedienteService: ExpedienteTlalcalliService,
    private fileService: FileService,
    private dialog: MatDialog
  ) {
    effect(()=>{
      const datos = this.sharedDataService.formData();
      this.folio_interno= datos.folio_interno;
      this.carpeta_investigacion= datos.carpeta_investigacion;
      this.oficio= datos.oficio;
      this.autoridad_remitente= datos.autoridad_remitente;
      this.persona_relacionada= datos.persona_relacionada
      this.volante_jefatura= datos.volante_jefatura;
     this.turno_jefatura= datos.turno_jefatura;
    })
   }

  ngOnInit() {
    this.asuntoService.fileIsOpenUpdated.subscribe((fileIsOpen) => {
      this.editar = false;
      this.fileIsOpen = fileIsOpen;

    });
    // Suscripción a resultados de AKAMBA (AsuntoService)
    this.asuntoService.documentsUpdated.subscribe((documents) => {
      this.fileIsOpen = false;
      this.mostrarTabla = true;
      this.visualizarPdf = false;
      this.visualizarMsg = false;
      this.editar = false;
      this.tipoBusqueda = this.asuntoService.tipoBusqueda;
      this.newTableIsRendered = false;
      this.pdfIsRendered = false;
      this.formUpdateIsRendered = false;
      this.documents = documents;
      let index = 0;
      let page: Asunto[] = [];
      this.pages = [];
      this.pageSelected = 1;
      this.documents.forEach((document) => {
        page.push(document);
        index += 1;
        if (index === this.itemsPerPage) {
          this.pages.push(page);
          index = 0;
          page = [];
        }
      });
      if (page.length !== 0) this.pages.push(page);
    });
    
    // Suscripción a resultados de TLALCALLI (ExpedienteTlalcalliService)
    this.expedienteService.expedientesConsultados.subscribe((expedientes) => {
      console.log('📋 [TrackingTable] Expedientes Tlalcalli recibidos:', expedientes);
      console.log('📋 [TrackingTable] Cantidad de expedientes:', expedientes.length);
      
      // Debug: Verificar documento_pdf_nombre en cada expediente
      expedientes.forEach((exp, index) => {
        console.log(`📄 [TrackingTable] Expediente ${index + 1}:`, {
          id: exp.id_expediente,
          expediente: exp.expediente,
          oficio: exp.oficio,
          documento_pdf_nombre: exp.documento_pdf_nombre,
          tienePdf: !!(exp.documento_pdf_nombre && exp.oficio)
        });
      });
      
      this.fileIsOpen = false;
      this.mostrarTabla = true;
      this.visualizarPdf = false;
      this.visualizarMsg = false;
      this.editar = false;
      this.tipoBusqueda = 'Tlalcalli';
      this.newTableIsRendered = false;
      this.pdfIsRendered = false;
      this.formUpdateIsRendered = false;
      
      // Asignar expedientes recibidos
      this.expedientesTlalcalli = expedientes || [];
      console.log('📋 [TrackingTable] expedientesTlalcalli asignados:', this.expedientesTlalcalli.length);
      
      // Limpiar y crear páginas
      let index = 0;
      let page: ExpedienteTlalcalli[] = [];
      this.pagesExpedientes = [];
      this.pageSelected = 1;
      
      this.expedientesTlalcalli.forEach((expediente) => {
        // Debug: Verificar documento_pdf_nombre antes de agregar a la página
        const tienePdf = expediente.documento_pdf_nombre && 
                         expediente.documento_pdf_nombre !== null && 
                         expediente.documento_pdf_nombre !== '' && 
                         expediente.documento_pdf_nombre.trim() !== '' &&
                         expediente.oficio;
        if (tienePdf) {
          console.log('✅ [TrackingTable] Expediente con PDF encontrado:', {
            id: expediente.id_expediente,
            expediente: expediente.expediente,
            oficio: expediente.oficio,
            documento_pdf_nombre: expediente.documento_pdf_nombre
          });
        }
        page.push(expediente);
        index += 1;
        if (index === this.itemsPerPage) {
          this.pagesExpedientes.push(page);
          index = 0;
          page = [];
        }
      });
      if (page.length !== 0) {
        this.pagesExpedientes.push(page);
      }
      
      console.log('📋 [TrackingTable] Páginas creadas:', this.pagesExpedientes.length);
      console.log('📋 [TrackingTable] Primera página tiene:', this.pagesExpedientes[0]?.length || 0, 'expedientes');
    });
  }

  scrollToTable(): void {
    const element = document.getElementById('sectionTable');
    if (element !== null && !this.newTableIsRendered) {
      this.scrolltoElement(element, 100);
      this.newTableIsRendered = true;
    }
  }
  scrollToPDF(): void {
    const element = document.getElementById('sectionPDF');
    if (element !== null && !this.pdfIsRendered) {
      this.scrolltoElement(element, 1000);
      this.pdfIsRendered = true;
    }
  }

  scrolltoElement(element: HTMLElement, checkEvery: number): void {
    setTimeout(() => {
      if (window.scrollY !== element.offsetTop) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      }
    }, checkEvery);
  }


  toggleExpansion(index: number): void {
    this.index = index
    this.isExpanded = true;
    // console.log("isExpanded", this.isExpanded);
    // console.log("INDEX",this.index);
  }

  closeExpansion(index: number): void {
    this.index = index
    this.isExpanded = false;
    // console.log("isExpanded", this.isExpanded);
    // console.log("INDEX",this.index);
  }

  verDetalleExpediente(expediente: ExpedienteTlalcalli): void {
    console.log('👁️ Ver detalle de expediente:', expediente);
    
    // Abrir modal con el detalle del expediente
    this.dialog.open(ExpedienteDetalleModalComponent, {
      width: '96vw',
      maxWidth: '1400px',
      height: '92vh',
      maxHeight: '92vh',
      panelClass: 'expediente-detalle-dialog',
      data: { expediente: expediente },
      disableClose: false
    });
  }

  /**
   * Ver PDF directamente desde la tabla
   */

  /**
   * Formatear fecha que viene como string del backend (YYYY-MM-DD) a DD/MM/YYYY
   */
  formatearFecha(fecha: string | Date | null | undefined): string {
    if (!fecha) return '-';
    
    // Si ya es un Date, formatearlo
    if (fecha instanceof Date) {
      return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    
    // Si es string (formato YYYY-MM-DD del backend)
    if (typeof fecha === 'string') {
      const partes = fecha.split('-');
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
      return fecha;
    }
    
    return '-';
  }


  getRol(): string {
    const sessionInfo = localStorage.getItem('sessionInfo');
    if (sessionInfo !== null) {
      const parse = JSON.parse(sessionInfo);
      const rol = parse.roles;
      return rol;
    }
    return "";
  }


  getFileName(path: string): string {
    const split: string[] = path.replace('\\\\', '\\').split('\\');
    const name = split.pop()?.replaceAll(' ', '_');
    return name != undefined ? name.replaceAll('#', '') : '';
  }

  getExtension(route: string): string | undefined {
    const name = this.getFileName(route);
    return name.split('.').pop()?.toLocaleLowerCase();
  }

  openPdfViewer(folio: string, path: string): void {
    const fileName = this.getFileName(path).replaceAll(' ', '_');
    if (folio === null) folio = "sinasignar";
    this.fileService.updatePdfFile(folio.toString(), fileName);
    this.asuntoService.openPdf();
    this.visualizarPdf = true;
    this.mostrarTabla = false;
    this.editar = false;
  }

  openMsgReader(folio: string, path: string): void {
    const fileName = this.getFileName(path).replaceAll(' ', '_');
    this.fileService.updateMsgFile(folio.toString(), fileName);
    this.asuntoService.openMsg();
    this.visualizarMsg = true;
    this.mostrarTabla = false;
    this.editar = false
  }

  printPdf(folio: string, path: string): void {
    const fileName = this.getFileName(path);
    this.fileService.printPdf(folio.toString(), fileName);
  }

  updateTable(fila: any) {
    // console.log("Entro");
    this.editar = true;
    this.mostrarTabla = false;
    this.filaSeleccionada = fila;
  }

  seleccionarFila(fila: any) {
    // console.log("Fila");
    this.filaSeleccionada = fila;
  }

  showAgainTable() {
    this.mostrarTabla = true;
    this.editar = false
  }

  mostrarTable() {
    this.mostrarTabla = true;
    this.visualizarPdf = false;
    this.fileIsOpen = false;
  }

  private sharedDataService = inject(SharedDataFormService);
  datos = computed(()=> this.sharedDataService.formData())



  getDownloadExcel(): void {
    // Si hay expedientes Tlalcalli, descargar esos
    if (this.tipoBusqueda === 'Tlalcalli' && this.expedientesTlalcalli.length > 0) {
      // Obtener los filtros actuales del formulario
      const filtros = this.sharedDataService.formData();
      
      // Llamar al servicio para descargar Excel
      this.expedienteService.descargarExcelExpedientes(filtros).subscribe({
        next: (blob) => {
          // Crear un enlace temporal para descargar el archivo
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `expedientes_tlalcalli_${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error al descargar Excel:', error);
          alert('Error al descargar el archivo Excel. Por favor, intente nuevamente.');
        }
      });
    } else {
      // Para asuntos Akamba, usar el método original
      this.asuntoService.downloadExcelTable(
      this.folio_interno,
      this.carpeta_investigacion,
      this.oficio,
      this.autoridad_remitente,
      this.persona_relacionada,
      this.volante_jefatura,
     this.turno_jefatura
      );
    }
  }
}
