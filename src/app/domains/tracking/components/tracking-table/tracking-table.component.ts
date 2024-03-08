import { Component, Input } from '@angular/core';
import { AsuntoService } from '../../../services/asunto.service';
import { Asunto } from '../../../interfaces/asuntos.interfaces';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';

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


  constructor(private asuntoService: AsuntoService, private router: Router) {}

  ngOnInit() {
    this.openPdf = false;
    this.asuntoService.documentsUpdated.subscribe((documents) => {
      this.router.navigate(['/site/rep/consulta/tracking']);
      this.openPdf = false;
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

  openPdfViewer() {
    this.openPdf = true;
    this.router.navigate(['/site/rep/consulta/tracking/pdfViewer']);
  }

  previousPage() {
    this.pageSelected -= 1;
  }

  nextPage() {
    this.pageSelected += 1;
  }
}
function BooleanArray(arg0: number): never[] {
  throw new Error('Function not implemented.');
}

