import { Component, ElementRef, ViewChild } from '@angular/core';
import { AsuntoService } from '../../../services/asunto.service';
import { Asunto } from '../../../interfaces/asuntos.interfaces';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatIcon } from '@angular/material/icon';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { FileService } from '../../../services/file.service';
import { EditTackingTableComponent } from '../edit-tacking-table/edit-tacking-table.component';
import { PdfViewerComponent } from '../../../components/pdf-viewer/pdf-viewer.component';
import { MsgReaderComponent } from '../../../components/msg-reader/msg-reader.component';


@Component({
  selector: 'app-tracking-table',
  standalone: true,
  imports: [PdfViewerModule, MatIcon, NgxPaginationModule, CommonModule, EditTackingTableComponent, PdfViewerComponent, MsgReaderComponent],
  templateUrl: './tracking-table.component.html',
  styleUrl: './tracking-table.component.css',
})
export class TrackingTableComponent {
  public documents: Asunto[] = [];
  public pages: Asunto[][] = [];

  public description: Asunto[] =[]

  public pageSelected: number = 1;

  public itemsPerPage: number = 5;

  public tipoBusqueda: string = '';

  public newTableIsRendered: boolean = false;

  public formUpdateIsRendered: boolean = false;
 
  public fileIsOpen: boolean = false;

  public visualizarPdf: boolean = false;

  public visualizarMsg: boolean = false;

  editar: boolean = false

  shortDescription: boolean = false

  isExpanded:boolean = false;

  mostrarTodo = false;

  index: number = -1;



  filaSeleccionada: any

  public mostrarTabla: boolean = false;

  clickclose: boolean = false;

  public labels = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
  };
  @ViewChild("edit-tacking-table") miComponente!: ElementRef;

  constructor(
    private asuntoService: AsuntoService,
    private fileService: FileService,
  ) { }

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
      const checkEvery = 100;
      setTimeout(() => {
        if (window.scrollY !== element.offsetTop) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
          });
        }
      }, checkEvery);
      this.newTableIsRendered = true;
    }
  }
   toggleExpansion(index:number):void{
    this.index = index
    this.isExpanded = !this.isExpanded;
    console.log("isExpanded", this.isExpanded);

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

  scrollToTableUpdate(): void {
    const element = document.getElementById("sectionUpdate");
    if (element !== null && !this.formUpdateIsRendered) {
      const checkEvery = 100
      setTimeout(() => {
        if (window.scrollY !== element.offsetTop) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest',
          });
        }
      }, checkEvery);
    }
    this.formUpdateIsRendered = true;
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
    if(folio === null) folio = "sinasignar";
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
    console.log("Entro");
    this.editar = true;
    this.mostrarTabla = false;
    this.filaSeleccionada = fila;
  }

  seleccionarFila(fila: any) {
    console.log("Fila");
    this.filaSeleccionada = fila;
  }

  showAgainTable() {
    this.mostrarTabla = true;
    this.editar = false
  }
}


