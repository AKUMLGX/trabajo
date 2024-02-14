import { Component } from '@angular/core';
import { AsuntoService } from '../../../services/asunto.service';
import { Asunto } from '../../../interfaces/asuntos.interfaces';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-tracking-table',
  standalone: true,
  imports: [PdfViewerModule, MatIcon],
  templateUrl: './tracking-table.component.html',
  styleUrl: './tracking-table.component.css',
})
export class TrackingTableComponent {
  public documents: Asunto[] = [];
  public pages: Asunto[][] = [];

  public pageSelected: number = 0;

  private _elementsByPage: number = 5;

  public tipoBusqueda = '';

  public newTableIsRendered = false;

  constructor(private asuntoService: AsuntoService, private router: Router) {}

  ngOnInit() {
    this.asuntoService.documentsUpdated.subscribe((documents) => {
      this.tipoBusqueda = this.asuntoService.tipoBusqueda;
      this.newTableIsRendered = false;
      this.documents = documents;
      let index = 0;
      let page: Asunto[] = [];
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
      if (this.pages.length === 0 && page.length !== 0) this.pages.push(page);
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
