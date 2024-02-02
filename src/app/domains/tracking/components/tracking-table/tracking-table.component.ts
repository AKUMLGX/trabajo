import { Component, Input } from '@angular/core';
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
  
  @Input({ required: false }) pageSelected!: number;

  private _elementsByPage = 5;

  constructor(private asuntoNuevoService: AsuntoHistoricoService) { }

  ngOnInit() {
    this.asuntoNuevoService.documentsUpdated.subscribe((documents) => {
      this.documents = documents;
      let index = 0;
      let page: AsuntoHistorico[] = [];
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
    const element = document.querySelector("#sectionTable");
    if (element != null) element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  }
}
