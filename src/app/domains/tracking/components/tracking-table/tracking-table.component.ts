import { Component, Input } from '@angular/core';
import { AsuntoService } from '../../../services/asunto.service';
import { Asunto } from '../../../interfaces/asuntos.interfaces';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { FileService } from '../../../services/file.service';

@Component({
  selector: 'app-tracking-table',
  standalone: true,
  imports: [PdfViewerModule, MatIcon, NgxPaginationModule, CommonModule],
  templateUrl: './tracking-table.component.html',
  styleUrl: './tracking-table.component.css',
})
export class TrackingTableComponent {
  public documents: Asunto[] = [];
  public pages: Asunto[][] = [];

  public pageSelected: number = 1;

  public itemsPerPage: number = 5;

  public tipoBusqueda: string = '';

  public openPdf: boolean = false;

  public newTableIsRendered: boolean = false;

  public labels = {
    previousLabel: 'Anterior',
    nextLabel: 'Siguiente',
  };

  constructor(
    private asuntoService: AsuntoService,
    private fileService: FileService,
    private router: Router
  ) {}

  ngOnInit() {
    this.openPdf = false;
    this.asuntoService.documentsUpdated.subscribe((documents) => {
      this.openPdf = this.asuntoService.pdfIsOpen;
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
    let name = split.pop();
    return name != undefined ? name.replaceAll('#', '') : '';
  }

  getExtension(route: String): string | undefined {
    let name = this.getFileName(route);
    return name.split('.').pop()?.toLocaleLowerCase();
  }

  openPdfViewer(folio: String, path: String): void {
    let fileName = this.getFileName(path);
    this.fileService.updatePdfFile(folio.toString(), fileName);
    this.asuntoService.pdfIsOpen = true;
    this.router.navigate(['/layout/tracking/pdfViewer']);
  }

  openMsgReader(): void {
    //this.asuntoService.pdfIsOpen = true;
    //this.router.navigate(['/layout/tracking/pdfViewer']);
  }

  printPdf(folio: String, path: String): void {
    let fileName = this.getFileName(path);
    this.fileService.printFile(folio.toString(), fileName);
  }
}
