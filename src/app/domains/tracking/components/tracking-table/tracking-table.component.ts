import { Component, ElementRef, ViewChild  } from '@angular/core';
import { AsuntoService } from '../../../services/asunto.service';
import { Asunto } from '../../../interfaces/asuntos.interfaces';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatIcon } from '@angular/material/icon';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { FileService } from '../../../services/file.service';
import { Router } from '@angular/router';
import { EditTackingTableComponent } from '../edit-tacking-table/edit-tacking-table.component';


@Component({
  selector: 'app-tracking-table',
  standalone: true,
  imports: [PdfViewerModule, MatIcon, NgxPaginationModule, CommonModule,EditTackingTableComponent],
  templateUrl: './tracking-table.component.html',
  styleUrl: './tracking-table.component.css',
})
export class TrackingTableComponent {
  public documents: Asunto[] = [];
  public pages: Asunto[][] = [];

  public pageSelected: number = 1;

  public itemsPerPage: number = 5;

  public tipoBusqueda: string = '';

  public newTableIsRendered: boolean = false;

  public pdfIsOpen: boolean = false;

  public labels = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
  };

  editar:boolean= false

  filaSeleccionada: any

  mostrarTabla: boolean = false
  clickclose: boolean = false


  @ViewChild("edit-tacking-table") miComponente!: ElementRef;


  constructor(
    private asuntoService: AsuntoService,
    private fileService: FileService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.asuntoService.pdfIsOpenUpdated.subscribe((pdfIsOpen) => {
      this.pdfIsOpen = pdfIsOpen;
    });
    this.asuntoService.documentsUpdated.subscribe((documents) => {
      this.tipoBusqueda = this.asuntoService.tipoBusqueda;
      this.newTableIsRendered = false;
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
    let fileName = this.getFileName(path);
    this.fileService.updatePdfFile(folio.toString(), fileName);
    this.asuntoService.openPdf();
    this.router.navigate(['/layout/tracking/pdfViewer']);
  }

  openMsgReader(folio: String, path: String): void {
    let fileName = this.getFileName(path).replaceAll(' ', '_');
    this.fileService.updateMsgFile(folio.toString(), fileName);
    this.asuntoService.openMsg();
    this.router.navigate(['/layout/tracking/msgReader']);
  }

  printPdf(folio: String, path: String): void {
    let fileName = this.getFileName(path);
    this.fileService.printPdf(folio.toString(), fileName);
  }

  updateTable(){
     this.editar= true
     this.mostrarTabla=false
     console.log("mostrarTabla",this.mostrarTabla);
     console.log("editar",this.editar);
  }

  seleccionarFila(fila: any) {
    this.filaSeleccionada = fila;
    console.log(this.filaSeleccionada);
  }

  showAgainTable() {
    this.mostrarTabla=false
    this.editar=false
    console.log("mostrarTabla PT-!",this.mostrarTabla);
    console.log("editar PT-!",this.editar);

  }





}
