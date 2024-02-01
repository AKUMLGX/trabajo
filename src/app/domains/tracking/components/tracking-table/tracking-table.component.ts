import { Component } from '@angular/core';
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
  constructor(private asuntoNuevoService: AsuntoHistoricoService) { }

  ngOnInit() {
    this.asuntoNuevoService.documentsUpdated.subscribe((documents) => {
      this.documents = documents;
    });
  }

}
