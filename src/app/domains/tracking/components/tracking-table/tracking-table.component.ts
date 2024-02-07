import { Component, EventEmitter, Output } from '@angular/core';
import { AsuntoHistoricoService } from '../../../services/asuntoHistorico.service';
import { AsuntoHistorico } from '../../../interfaces/asuntos.interfaces';

@Component({
  selector: 'app-tracking-table',
  standalone: true,
  imports: [],
  templateUrl: './tracking-table.component.html',
  styleUrl: './tracking-table.component.css',
})
export class TrackingTableComponent {
  public documents: AsuntoHistorico[] = [];
  public pages: AsuntoHistorico[][] = [];

  public pageSelected: number = 0;

  private _elementsByPage: number = 5;

  public newTableIsRendered = false;

  constructor(private asuntoNuevoService: AsuntoHistoricoService) {}

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
