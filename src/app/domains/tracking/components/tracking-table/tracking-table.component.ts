import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AsuntoHistoricoService } from '../../../services/asuntoHistorico.service';
import { AsuntoHistorico } from '../../../interfaces/asuntos.interfaces';
import { FileService } from '../../../services/file.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tracking-table',
  standalone: true,
  imports: [PdfViewerModule],
  templateUrl: './tracking-table.component.html',
  styleUrl: './tracking-table.component.css',
})
export class TrackingTableComponent {
  public documents: AsuntoHistorico[] = [];
  public pages: AsuntoHistorico[][] = [];

  public pageSelected: number = 0;

  private _elementsByPage: number = 5;

  public newTableIsRendered = false;

  constructor(private asuntoNuevoService: AsuntoHistoricoService, private router: Router) {}

  ngOnInit() {
    this.asuntoNuevoService.documentsUpdated.subscribe((documents) => {
      this.newTableIsRendered = false;
      this.documents = documents;
      let index = 0;
      let page: AsuntoHistorico[] = [];
      this.pages = [];
      this.pageSelected = 0;
      this.documents.forEach((document) => {
        page.push(document);
        index += 1;
        if (index === this._elementsByPage) {
          this.pages.push(page);
          index = 0;
          page = [];
        }
      });
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
    this.router.navigate(['/site/rep/consulta/pdfViewer']);

  }

  updatePageSelected(page: number) {
    this.pageSelected = page;
  }

  previousPage() {
    this.pageSelected -= 1;
  }

  nextPage() {
    this.pageSelected += 1;
  }
}
