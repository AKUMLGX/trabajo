import { Component, OnInit } from '@angular/core';
import { AsuntoNuevoService } from '../../../services/asunto-nuevo.service';

@Component({
  selector: 'app-tracking-table',
  standalone: true,
  imports: [],
  templateUrl: './tracking-table.component.html',
  styleUrl: './tracking-table.component.css',
})
export class TrackingTableComponent{
  constructor(private asuntoNuevoService: AsuntoNuevoService) {}

  ngOnInit() {
    this.asuntoNuevoService.documentsUpdated.subscribe((documents) => {
      console.log("Se obtienen documentos " + documents);
    });
  }
}
