import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, inject, ViewChild } from '@angular/core';
import { AsuntoService } from '../../../services/asunto.service';
import { Asunto } from '../../../interfaces/asuntos.interfaces';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatIcon } from '@angular/material/icon';
import { NgxPaginationModule } from 'ngx-pagination';
import   '../../../../../../node_modules/lib-itsi/src/components/button/button.js';
import { CommonModule } from '@angular/common';
import { FileService } from '../../../services/file.service';
import { EditTackingTableComponent } from '../edit-tacking-table/edit-tacking-table.component';
import { PdfViewerComponent } from '../../../components/pdf-viewer/pdf-viewer.component';
import { MsgReaderComponent } from '../../../components/msg-reader/msg-reader.component';
import { SharedDataFormService } from '../../../shared/services/shared-data-form.service';



@Component({
  selector: 'app-tracking-table',
  standalone: true,
  imports: [
    PdfViewerModule,
    MatIcon,
    NgxPaginationModule,
    CommonModule,
    EditTackingTableComponent,
    PdfViewerComponent,
    MsgReaderComponent,

  ],

  templateUrl: './tracking-table.component.html',
  styleUrl: './tracking-table.component.css',
  schemas:[
    CUSTOM_ELEMENTS_SCHEMA
  ]
})



export class TrackingTableComponent {
  public documents: Asunto[] = [];
  public pages: Asunto[][] = [];

  public description: Asunto[] = []

  public pageSelected: number = 1;

  public itemsPerPage: number = 20;

  public tipoBusqueda: string = '';

  public newTableIsRendered: boolean = false;

  public pdfIsRendered: boolean = false;

  public formUpdateIsRendered: boolean = false;

  public fileIsOpen: boolean = false;

  public visualizarPdf: boolean = false;

  public visualizarMsg: boolean = false;

  editar: boolean = false

  isExpanded: boolean = false;

  index: number = 0;



  filaSeleccionada: any

  public mostrarTabla: boolean = false;

  clickclose: boolean = false;

  public labels = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
  };
  @ViewChild("edit-tacking-table") miComponente!: ElementRef;


  folio_interno: string= ""
  carpeta_investigacion: string= ""
  oficio: string= ""
  autoridad_remitente: string= ""
  persona_relacionada: string= ""
  volante_jefatura: string= ""
  turno_jefatura: string= ""

  constructor(
    private asuntoService: AsuntoService,
    private fileService: FileService,
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


  getRol(): string {
    let sessionInfo = localStorage.getItem('sessionInfo');
    if (sessionInfo !== null) {
      let parse = JSON.parse(sessionInfo);
      let rol = parse.roles;
      return rol;
    }
    return "";
  }


  getFileName(path: String): string {
    let split: string[] = path.replace('\\\\', '\\').split('\\');
    let name = split.pop()?.replaceAll(' ', '_');
    return name != undefined ? name.replaceAll('#', '') : '';
  }

  getExtension(route: String): string | undefined {
    let name = this.getFileName(route);
    return name.split('.').pop()?.toLocaleLowerCase();
  }

  openPdfViewer(folio: String, path: String): void {
    let fileName = this.getFileName(path).replaceAll(' ', '_');
    if (folio === null) folio = "sinasignar";
    this.fileService.updatePdfFile(folio.toString(), fileName);
    this.asuntoService.openPdf();
    this.visualizarPdf = true;
    this.mostrarTabla = false;
    this.editar = false;
  }

  openMsgReader(folio: String, path: String): void {
    let fileName = this.getFileName(path).replaceAll(' ', '_');
    this.fileService.updateMsgFile(folio.toString(), fileName);
    this.asuntoService.openMsg();
    this.visualizarMsg = true;
    this.mostrarTabla = false;
    this.editar = false
  }

  printPdf(folio: String, path: String): void {
    let fileName = this.getFileName(path);
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



  getDownloadExcel():void{
      this.asuntoService.downloadExcelTable(
      this.folio_interno,
      this.carpeta_investigacion,
      this.oficio,
      this.autoridad_remitente,
      this.persona_relacionada,
      this.volante_jefatura,
     this.turno_jefatura
      )
  }
}
