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

  public flag = false;

  constructor(private asuntoNuevoService: AsuntoHistoricoService) {}

  ngOnInit() {
    this.asuntoNuevoService.documentsUpdated.subscribe((documents) => {
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
      this.flag = false;
    });
  }

  scrollToTable(): void {
    const element = document.querySelector('#sectionTable');
    if (element != null) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
      this.flag = true;
    }
  }

  updatePageSelected(page: number) {
    this.pageSelected = page;
    console.log(this.pages[this.pageSelected]);
  }

  previousPage() {
    this.pageSelected -= 1;
  }

  nextPage() {
    this.pageSelected += 1;
  }
}
