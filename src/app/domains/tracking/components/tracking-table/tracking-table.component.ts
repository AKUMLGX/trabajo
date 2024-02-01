import { Component } from '@angular/core';
import { AsuntoHistoricoService } from '../../../services/asuntoHistorico.service';

@Component({
  selector: 'app-tracking-table',
  standalone: true,
  imports: [],
  templateUrl: './tracking-table.component.html',
  styleUrl: './tracking-table.component.css',
})
export class TrackingTableComponent{
  constructor(private asuntoNuevoService: AsuntoHistoricoService) {}

  ngOnInit() {
    this.asuntoNuevoService.documentsUpdated.subscribe((documents) => {
      console.log("Se obtienen documentos " + documents);
    });
  }
}
