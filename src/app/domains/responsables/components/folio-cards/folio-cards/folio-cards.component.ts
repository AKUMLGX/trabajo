import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FolioCard, EstadisticoAtencionResponse } from '../../../../interfaces/foliocard.interface';

@Component({
  selector: 'app-folio-cards',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './folio-cards.component.html',
})
export class FolioCardsComponent {
    @Input() folios: FolioCard[] = [];
}
